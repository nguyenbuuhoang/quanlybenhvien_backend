import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken } from './entities/reset-token.entity';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ResetToken)
    private resetTokenRepository: Repository<ResetToken>,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async signup(signupData: SignupDto) {
    const { email, password, fullname, username } = signupData;

    //Kiểm tra email hoặc tên người dùng đã được sử dụng chưa
    const emailInUse = await this.userRepository.findOne({ where: { email } });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    const usernameInUse = await this.userRepository.findOne({ where: { username } });
    if (usernameInUse) {
      throw new BadRequestException('Username already in use');
    }
    //Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gán vai trò mặc định là 'user'
    const defaultRole = await this.rolesService.getRoleByName('user');
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role "user" not found');
    }
    // Tạo người dùng mới và lưu vào MySQL
    const user = this.userRepository.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      roleId: defaultRole.id,
    });
    const savedUser = await this.userRepository.save(user);
    return {
      success: true,
      message: 'User created successfully',
      data: {
        id: savedUser.id,
        fullname: savedUser.fullname,
        username: savedUser.username,
        email: savedUser.email,
        role: defaultRole.name,
        createdAt: savedUser.createdAt,
      },
    };
  }

  async login(credentials: LoginDto) {
    const { usernameOrEmail, password } = credentials;
    //Tìm người dùng theo tên đăng nhập hoặc email
    const user = await this.userRepository.findOne({
      where: [
        { email: usernameOrEmail },
        { username: usernameOrEmail },
      ],
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //So sánh mật khẩu nhập vào với mật khẩu đã lưu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Tạo JWT token
    const tokens = await this.generateUserTokens(user.id);
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          role: user.role ? user.role.name : null,
        },
        ...tokens,
      },
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Tìm người dùng
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //So sánh mật khẩu cũ với mật khẩu trong cơ sở dữ liệu
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Đổi mật khẩu cho người dùng
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await this.userRepository.save(user);
    
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        expiresIn: MoreThanOrEqual(new Date()),
      },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    const tokens = await this.generateUserTokens(token.userId);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: number) {
    // Tính ngày hết hạn sau 3 ngày kể từ bây giờ
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    // Kiểm tra refresh token đã tồn tại cho người dùng này chưa
    const existingToken = await this.refreshTokenRepository.findOne({
      where: { userId },
    });

    if (existingToken) {
      // Cập nhật token đã có
      existingToken.token = token;
      existingToken.expiresIn = expiryDate;
      await this.refreshTokenRepository.save(existingToken);
    } else {
      // Tạo token mới
      const newToken = this.refreshTokenRepository.create({
        token,
        userId,
        expiresIn: expiryDate,
      });
      await this.refreshTokenRepository.save(newToken);
    }
  }

  async getUserPermissions(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException();

    if (!user.roleId) return [];

    const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role ? role.permissions : [];
  }
}