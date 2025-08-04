import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ name: 'expires_in', type: 'datetime' })
  expiresIn: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
