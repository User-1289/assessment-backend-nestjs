import { Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Products } from './entities/products.entity';
import { Orders } from './entities/orders.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
  ) {}

  getHello(@Query('name') name: string): string {
    return `Hello ${name ?? 'World'}!`;
  }

  async createCustomer(customerData: { name: string; email: string }): Promise<Customer> {
    const customer = this.customerRepo.create(customerData);
    return this.customerRepo.save(customer);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepo.find();
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    return this.customerRepo.findOne({ where: { customer_id: parseInt(customerId) } });
  }

  async createProduct(productData: { name: string; price: number; stock_left: number }): Promise<Products> {
    const product = this.productRepo.create(productData);
    return this.productRepo.save(product);
  }

  async getAllProducts(): Promise<Products[]> {
    return this.productRepo.find();
  }

  async getProductById(productId: string): Promise<Products | null> {
    return this.productRepo.findOne({ where: { product_id: parseInt(productId) } });
  }

  async createOrder(orderData: { product: Products }): Promise<Orders> {
    // Create the order with proper structure
    const order = this.orderRepo.create({
      product: orderData.product,
      date_added: new Date().toISOString(),
    });
    return this.orderRepo.save(order);
  }

  // Updated to include product relation
  async getAllOrders(): Promise<Orders[]> {
    return this.orderRepo.find({
      relations: ['product'], // This will populate the product relation
    });
  }

  // Updated to include product relation
  async getOrderById(orderId: string): Promise<Orders | null> {
    return this.orderRepo.findOne({ 
      where: { order_id: parseInt(orderId) },
      relations: ['product'], // This will populate the product relation
    });
  }

  // Alternative method using QueryBuilder for more complex queries
  async getAllOrdersWithDetails(): Promise<Orders[]> {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .getMany();
  }

  // Method to get orders with specific product fields only
  async getAllOrdersWithProductInfo(): Promise<any[]> {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .select([
        'order.order_id',
        'order.date_added',
        'product.product_id',
        'product.name',
        'product.price'
      ])
      .getMany();
  }
}