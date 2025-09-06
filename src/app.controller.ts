import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('name') name: string): { message: string } {
    return { message: this.appService.getHello(name) };
  }

  @Get('health')
  getHealth(@Query('q') q: string): { status: string; query: string } {
    return { status: 'ok', query: q ?? '' };
  }

  @Post('customers')
  async createCustomer(
    @Body() customerData: { name: string; email: string },
  ): Promise<any> {
    const obj = {
      name: customerData.name,
      email: customerData.email,
      date_added: new Date().toISOString(),
    };
    return this.appService.createCustomer(obj);
  }

  @Get('customers')
  async getAllCustomers(): Promise<any> {
    return this.appService.getAllCustomers();
  }

  @Get('customer/:customer_id')
  async getCustomerById(
    @Param('customer_id') customerId: string,
  ): Promise<any> {
    return this.appService.getCustomerById(customerId);
  }

  @Post('products')
  async createProduct(
    @Body() productData: { name: string; price: number; stock_left: number },
  ): Promise<any> {
    const obj = {
      name: productData.name,
      price: productData.price,
      stock_left: productData.stock_left,
      date_added: new Date().toISOString(),
    };
    return this.appService.createProduct(obj);
  }

  @Get('products')
  async getAllProducts(): Promise<any> {
    return this.appService.getAllProducts();
  }

  @Get('product/:product_id')
  async getProductById(@Param('product_id') productId: string): Promise<any> {
    return this.appService.getProductById(productId);
  }

  @Post('orders')
  async createOrder(@Body() orderData: { product_id: number }): Promise<any> {
    const product = await this.appService.getProductById(
      orderData.product_id.toString(),
    );
    if (!product) {
      throw new Error('Product not found');
    }
    const obj = {
      product: product,
    };
    return this.appService.createOrder(obj);
  }

  @Get('orders')
  async getAllOrders(): Promise<any> {
    return this.appService.getAllOrders();
  }
}
