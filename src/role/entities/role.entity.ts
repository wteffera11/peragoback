import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne((role) => Role, (parent) => parent.children, {
    nullable: true,
    cascade: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Role;

  @Column({ nullable: true })
  parent_id: number;

  @OneToMany((role) => Role, (child) => child.parent, { cascade: false })
  children: Role[];
}
