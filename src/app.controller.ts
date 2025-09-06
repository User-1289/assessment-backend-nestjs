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

  @Get("/api/dashboard/metrics")
  async getDashboardMetrics(@Query('date_start') dateStart: string, @Query('date_end') dateEnd: string): Promise<any> {
    return this.appService.getDashboardMetrics(dateStart, dateEnd);
  }
}
