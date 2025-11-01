"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    usersRepo;
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    async list(offset = 0, limit = 10) {
        const [items, total] = await this.usersRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit,
            select: ['id', 'username', 'email', 'createdAt'],
        });
        return { items, total, offset, limit };
    }
    async findOne(id) {
        const user = await this.usersRepo.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findByEmail(email) {
        return this.usersRepo.findOne({ where: { email } });
    }
    async findByUsername(username) {
        return this.usersRepo.findOne({ where: { username } });
    }
    async create(username, email, passwordHash) {
        const user = this.usersRepo.create({ username, email, passwordHash });
        return this.usersRepo.save(user);
    }
    async update(id, username, email, password, currentPassword, profilePictureUrl) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (password && currentPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValidPassword) {
                throw new common_1.NotFoundException('Current password is incorrect');
            }
            user.passwordHash = await bcrypt.hash(password, 10);
        }
        if (username !== undefined && username !== null && username !== '') {
            user.username = username;
        }
        if (email !== undefined && email !== null && email !== '') {
            user.email = email;
        }
        if (profilePictureUrl !== undefined) {
            user.profilePictureUrl = profilePictureUrl || null;
        }
        const savedUser = await this.usersRepo.save(user);
        const { passwordHash: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }
    async remove(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.usersRepo.remove(user);
        return { message: 'User deleted' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map