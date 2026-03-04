import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ShowsModule } from '../shows/shows.module';

@Module({
    imports: [ShowsModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
