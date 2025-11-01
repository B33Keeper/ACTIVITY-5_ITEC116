"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const posts_service_1 = require("./posts.service");
const multer_1 = require("multer");
const path_1 = require("path");
class CreatePostDto {
    title;
    content;
    authorUsername;
    imageUrl;
}
class UpdatePostDto {
    title;
    content;
    authorUsername;
    imageUrl;
}
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    list(offset = 0, limit = 10) {
        return this.postsService.list(Number(offset), Number(limit));
    }
    findOne(id) {
        return this.postsService.findOne(Number(id));
    }
    create(req, title, content, authorUsername, file) {
        const username = req.user?.username || authorUsername || null;
        const imageUrl = file ? `/uploads/${file.filename}` : null;
        return this.postsService.create(title, content, username, imageUrl);
    }
    update(req, id, title, content, authorUsername, existingImageUrl, file) {
        const username = req.user?.username || authorUsername || null;
        const imageUrl = file ? `/uploads/${file.filename}` : existingImageUrl ?? undefined;
        return this.postsService.update(Number(id), title, content, username, imageUrl);
    }
    remove(req, id, body) {
        const username = req.user?.username || body?.authorUsername || null;
        return this.postsService.remove(Number(id), username);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, schema: { default: 0, type: 'number' } }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, schema: { default: 10, type: 'number' } }),
    __param(0, (0, common_1.Query)('offset')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
            const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
            const hasValidExtension = allowedExtensions.test(file.originalname);
            const hasValidMimeType = allowedMimeTypes.test(file.mimetype);
            if (!hasValidExtension || !hasValidMimeType) {
                const error = new Error('Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP');
                error.code = 'INVALID_FILE_TYPE';
                return cb(error, false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Body)('authorUsername')),
    __param(4, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number' }),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
            const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
            const hasValidExtension = allowedExtensions.test(file.originalname);
            const hasValidMimeType = allowedMimeTypes.test(file.mimetype);
            if (!hasValidExtension || !hasValidMimeType) {
                const error = new Error('Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP');
                error.code = 'INVALID_FILE_TYPE';
                return cb(error, false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('title')),
    __param(3, (0, common_1.Body)('content')),
    __param(4, (0, common_1.Body)('authorUsername')),
    __param(5, (0, common_1.Body)('imageUrl')),
    __param(6, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number' }),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "remove", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map