import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Post('upload-quiz')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (req, file, callback) => {
                if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
                    return callback(new BadRequestException('Only JSON files are allowed'), false);
                }
                callback(null, true);
            },
        }),
    )
    uploadQuiz(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file uploaded');
        return this.adminService.bulkUploadQuiz(file.buffer);
    }

    @Get('users')
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('users/:id/promote')
    promoteUser(@Param('id') id: string) {
        return this.adminService.promoteToAdmin(id);
    }
}
