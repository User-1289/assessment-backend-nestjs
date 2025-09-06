import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity'; // adjust path if needed
import { Products } from './entities/products.entity';
import { Orders } from './entities/orders.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'armaan',
      password: '1011',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      entities: [Customer, Products, Orders], // reference entity classes, not strings
    }),
    TypeOrmModule.forFeature([Customer, Products, Orders]), // <-- this enables repository injection
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}