import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request as NestRequest,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

class CreatePostDto {
  title!: string;
  content!: string;
  authorUsername?: string;
  imageUrl?: string;
}

class UpdatePostDto {
  title!: string;
  content!: string;
  authorUsername?: string;
  imageUrl?: string;
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, type: 'number' } })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 10, type: 'number' } })
  list(@Query('offset') offset = 0, @Query('limit') limit = 10) {
    return this.postsService.list(Number(offset), Number(limit));
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(Number(id));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
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
  @ApiConsumes('multipart/form-data')
  create(
    @NestRequest() req: any,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('authorUsername') authorUsername?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Get username from JWT token (req.user) or fallback to body
    const username = req.user?.username || authorUsername || null;
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    return this.postsService.create(title, content, username, imageUrl);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
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
  @ApiConsumes('multipart/form-data')
  update(
    @NestRequest() req: any,
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('authorUsername') authorUsername?: string,
    @Body('imageUrl') existingImageUrl?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Get username from JWT token (req.user) or fallback to body
    const username = req.user?.username || authorUsername || null;
    const imageUrl = file ? `/uploads/${file.filename}` : existingImageUrl ?? undefined;
    return this.postsService.update(Number(id), title, content, username, imageUrl);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(AuthGuard('jwt'))
  remove(@NestRequest() req: any, @Param('id') id: string, @Body() body?: { authorUsername?: string }) {
    // Get username from JWT token (req.user) or fallback to body
    const username = req.user?.username || body?.authorUsername || null;
    return this.postsService.remove(Number(id), username);
  }
}


