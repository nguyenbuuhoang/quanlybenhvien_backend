import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find({
      relations: ['role'],
      select: ['id', 'fullname', 'username', 'email', 'status', 'createdAt', 'updatedAt', 'roleId'],
    });
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['role'],
      select: ['id', 'fullname', 'username', 'email', 'status', 'createdAt', 'updatedAt', 'roleId'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async createUser(createUserData: CreateUserDto) {
    const { email, username, password, roleId } = createUserData;

    // Kiểm tra email và username đã tồn tại chưa
    const emailInUse = await this.userRepository.findOne({ where: { email } });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const usernameInUse = await this.userRepository.findOne({ where: { username } });
    if (usernameInUse) {
      throw new BadRequestException('Username already in use');
    }

    // Kiểm tra role có tồn tại không (nếu được cung cấp)
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new BadRequestException('Role not found');
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = this.userRepository.create({
      ...createUserData,
      password: hashedPassword,
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
        status: savedUser.status,
        roleId: savedUser.roleId,
      },
    };
  }

  async updateUser(id: string, updateUserData: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email, username, password, roleId } = updateUserData;

    // Kiểm tra email mới có bị trùng không
    if (email && email !== user.email) {
      const emailInUse = await this.userRepository.findOne({ where: { email } });
      if (emailInUse) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Kiểm tra username mới có bị trùng không
    if (username && username !== user.username) {
      const usernameInUse = await this.userRepository.findOne({ where: { username } });
      if (usernameInUse) {
        throw new BadRequestException('Username already in use');
      }
    }

    // Kiểm tra role có tồn tại không (nếu được cung cấp)
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new BadRequestException('Role not found');
      }
    }

    // Mã hóa mật khẩu mới (nếu có)
    if (password) {
      updateUserData.password = await bcrypt.hash(password, 10);
    }

    // Cập nhật user
    Object.assign(user, updateUserData);
    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
      data: {
        id: savedUser.id,
        fullname: savedUser.fullname,
        username: savedUser.username,
        email: savedUser.email,
        status: savedUser.status,
        roleId: savedUser.roleId,
      },
    };
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
