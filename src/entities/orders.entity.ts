import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import {Products} from './products.entity'
import { Customer } from './customer.entity';
@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  order_id: number;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column()
  date_added: string

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
  
}