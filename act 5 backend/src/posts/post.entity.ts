import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  // Denormalized author username for quick display; nullable for older rows
  @Column({ type: 'varchar', length: 80, nullable: true, default: null })
  authorUsername!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}


