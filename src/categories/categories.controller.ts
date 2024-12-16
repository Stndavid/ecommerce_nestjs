import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { HastRoles } from 'src/auth/jwt/hast.roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateCategoryDto } from './dto/create-categorry.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    usersService: any;

    constructor(private CategoriesService: CategoriesService){}
    
    
    @HastRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get()
    findAll(){
        return this.CategoriesService.findAll()

    }
    @HastRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post() // http://192.168.100.223:3000/categories
    @UseInterceptors(FileInterceptor('file'))
    createdWithImage(
        @UploadedFile(new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
              new FileTypeValidator({ fileType: '.(pgn|jpeg|jpg)' }),
            ],
          }),) file: Express.Multer.File,
          @Body() category:CreateCategoryDto
    ) {
    return this.CategoriesService.create(file, category);
    }

    @HastRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id') 
    update(@Param('id', ParseFilePipe)id:number,@Body() category: UpdateCategoryDto){
        return this.CategoriesService.update(id, category)
    }

    @HastRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put('upload/:id') // http://192.168.100.223:3000/categories
    @UseInterceptors(FileInterceptor('file'))
    updatedWithImage(
        @UploadedFile(new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
              new FileTypeValidator({ fileType: '.(pgn|jpeg|jpg)' }),
            ],
          }),) file: Express.Multer.File,
          @Param('id', ParseFilePipe) id: number,
          @Body() category:UpdateCategoryDto
    ) {
    return this.CategoriesService.updateWithImage(file,id, category);
    }

    @HastRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Delete(':id') 
    delete(@Param('id', ParseFilePipe)id:number){
        return this.CategoriesService.delete(id);
    }

}
