import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Orders } from './orders.entity';
@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  date_added: string

@Column({ type: 'varchar', length: 100, default: 'India', nullable: false })
region: string;
  

  @OneToMany(() => Orders, order => order.customer)
  orders: Orders[];
}