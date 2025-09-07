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

  async getDashboardMetrics(dateStart: string, dateEnd: string): Promise<any> {
    if(!dateStart || !dateEnd) {
      return { error: 'Both date_start and date_end query parameters are required.' };
    }
    const totalNewCustomers = await this.customerRepo.createQueryBuilder('customer')
      .where('customer.date_added BETWEEN :start AND :end', { start: dateStart, end: dateEnd })
      .getCount();
    const ordersInDateRange = await this.orderRepo.createQueryBuilder('order')
      .where('order.date_added BETWEEN :start AND :end', { start: dateStart, end: dateEnd })
      .getCount();
    const totalOrders = ordersInDateRange;
    let totalSales = 0;
    //const orders = await this.orderRepo.find({ relations: ['product'] });
    const orders = await this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.date_added BETWEEN :start AND :end', { start: dateStart, end: dateEnd })
      .getMany();

        // Get unique product count separately
    const uniqueProductResult = await this.orderRepo.createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .select('COUNT(DISTINCT product.product_id)', 'uniqueProductCount')
      .where('order.date_added BETWEEN :start AND :end', { start: dateStart, end: dateEnd })
      .getRawOne();
    orders.forEach(order => {
      if (order.product && order.product.price) {
        totalSales += order.product.price;
      }
    });
    return {
      totalNewCustomers,
      totalOrders,
      totalSales,
      uniqueProductCount: parseInt(uniqueProductResult.uniqueProductCount) || 0
    };
  }

async getDashboardRevenue() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const today = new Date();               
    const dayNumber = today.getDay();       
    const daysSinceMonday = (dayNumber + 6) % 7;
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - daysSinceMonday);

    const format = (d: Date) =>
      d.toISOString().split('T')[0];

    const weekDates: string[] = [];
    for (let i = 0; i <= daysSinceMonday; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(format(d));
    }

    const revenuePromises = weekDates.map(async (dateStr) => {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .where('DATE(order.date_added) = :date', { date: dateStr })
      .select('order.order_type', 'orderType')
      .addSelect('COUNT(order.order_id)', 'totalOrders')
      .addSelect('SUM(product.price)', 'totalSales')
      .groupBy('order.order_type')
      .getRawMany();

      const totalOrders = result.reduce((acc, curr) => acc + parseInt(curr.totalOrders, 10), 0);
      const totalSales = result.reduce((acc, curr) => acc + parseFloat(curr.totalSales), 0);

      const dateObj = new Date(dateStr);
      const dayName = dayNames[dateObj.getDay()];
      return {
        date: dateStr,
        totalOrders,
        totalSales,
        dayName,
        breakdown: result
      };
    });

    const revenueReport = await Promise.all(revenuePromises);

    return revenueReport; 
  }

    async getDashboardCustomerSat() {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();  

    const currMonthNumber = monthIndex + 1;  
    const prevMonthNumber = currMonthNumber === 1 ? 12 : currMonthNumber - 1;
    const prevMonthYear = currMonthNumber === 1 ? year - 1 : year;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[monthIndex];
    const prevMonthName = monthNames[prevMonthNumber - 1];

    const formatMonth = (y: number, m: number) =>
      `${y}-${m.toString().padStart(2, '0')}`;

    const getRevenueForMonth = async (y: number, m: number) => {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const result = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.product', 'product')
        .where('DATE(order.date_added) BETWEEN :start AND :end', { start: startStr, end: endStr })
        .select('SUM(product.price)', 'totalRevenue')
        .getRawOne();

      return parseFloat(result.totalRevenue) || 0;
    };

    const currMonthRevenue = await getRevenueForMonth(year, currMonthNumber);
    const prevMonthRevenue = await getRevenueForMonth(prevMonthYear, prevMonthNumber);

    return [
      {
        currmonthName: monthName,
        month: formatMonth(year, currMonthNumber),
        totalRevenue: currMonthRevenue
      },
      {
        prevMonthName,
        month: formatMonth(prevMonthYear, prevMonthNumber),
        totalRevenue: prevMonthRevenue
      }
    ];
  }

  async getVisitorInsights() {
const geoSales = await this.orderRepo
  .createQueryBuilder('order')
  .leftJoin('order.customer', 'customer')
  .leftJoin('order.product', 'product')
  .select("COALESCE(customer.region, 'Unknown')", 'region')
  .addSelect('COUNT(order.order_id)', 'salesCount')
  .addSelect('ARRAY_AGG(order.order_id)', 'orders')
  .groupBy('customer.region')
  .getRawMany();

    return geoSales;
  }  

  async getTopProducts() {
    const topProducts = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .select('product.product_id', 'productid')
      .addSelect('product.name', 'productname')
      .addSelect('product.price', 'price')
      .addSelect('COUNT(order.order_id)', 'salescount')
      .addSelect('SUM(product.price)', 'totalrevenue')
      .groupBy('product.product_id')
      .addGroupBy('product.name')
      .addGroupBy('product.price')
      .orderBy('totalrevenue', 'DESC')
      .getRawMany();

    return topProducts.map(product => ({
      productId: parseInt(product.productid),
      productName: product.productname,
      price: parseFloat(product.price),
      salesCount: parseInt(product.salescount),
      totalRevenue: parseFloat(product.totalrevenue)
    }));
  }
}