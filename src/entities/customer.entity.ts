import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}