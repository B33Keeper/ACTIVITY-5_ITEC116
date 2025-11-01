import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request as NestRequest,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

class CreateUserDto {
  username!: string;
  email!: string;
  password!: string;
}

class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, type: 'number' } })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 10, type: 'number' } })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  list(@Query('offset') offset = 0, @Query('limit') limit = 10) {
    return this.usersService.list(Number(offset), Number(limit));
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateUserDto) {
    // Would typically use AuthService.register instead, but providing for completeness
    return { message: 'Use /auth/register to create users' };
  }

  @Get('profile/me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@NestRequest() req: any) {
    return this.usersService.findOne(req.user.userId);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `profile_${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
        const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
        
        const hasValidExtension = allowedExtensions.test(file.originalname);
        const hasValidMimeType = allowedMimeTypes.test(file.mimetype);
        
        if (!hasValidExtension || !hasValidMimeType) {
          const error = new Error('Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP');
          (error as any).code = 'INVALID_FILE_TYPE';
          return cb(error, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async updateProfile(
    @NestRequest() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    // Only pass fields that are provided (not empty strings)
    const username = body.username && body.username.trim() !== '' ? body.username.trim() : undefined;
    const email = body.email && body.email.trim() !== '' ? body.email.trim() : undefined;
    const password = body.password && body.password.trim() !== '' ? body.password.trim() : undefined;
    const currentPassword = body.currentPassword && body.currentPassword.trim() !== '' ? body.currentPassword.trim() : undefined;
    
    // Handle profile picture - only update if new file is uploaded
    // If no file is uploaded, we don't pass profilePictureUrl so existing one is preserved
    const profilePictureUrl = file ? `/uploads/${file.filename}` : undefined;
    
    return this.usersService.update(userId, username, email, password, currentPassword, profilePictureUrl);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto.username, dto.email, dto.password);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}

