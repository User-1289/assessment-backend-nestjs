import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import {Products} from './products.entity'

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  order_id: number;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column()
  date_added: string
}