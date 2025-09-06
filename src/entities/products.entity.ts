import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Orders } from './orders.entity';
@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  product_id: number

  @Column()
  name: string

  @Column()
  stock_left: number

  @Column()
  date_added: string

  @OneToMany(() => Orders, order => order.product)
  orders: Orders[];

  @Column()
  price : number
}