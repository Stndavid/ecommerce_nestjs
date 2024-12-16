import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-categorry.dto';
import storage = require("../utils/cloud_storage")
import { Category } from './category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category) private categoriesResitory: Repository<Category>
    ){}

    findAll(){
        return this.categoriesResitory.find()
    }

    async create(file:Express.Multer.File, category: CreateCategoryDto){
        
        const url = await storage(file, file.originalname);
        if(url === undefined && url === null){
            throw new HttpException('La imagenn no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR);

        }
        category.image = url;
        const newCategory =  this.categoriesResitory.create(category);
        
        return this.categoriesResitory.save(newCategory)

    }
    async updateWithImage(file:Express.Multer.File, id:number, category: UpdateCategoryDto){
        
        const url = await storage(file, file.originalname);
        if(url === undefined && url === null){
            throw new HttpException('La imagenn no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR);

        }
        const categoryFound =  await this.categoriesResitory.findOneBy({id:id});
        if(!categoryFound){
            throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
        }
        category.image = url;
        const updatedCategory = Object.assign(categoryFound, category);
        return this.categoriesResitory.save(updatedCategory)

    }
    async update( id:number, category: UpdateCategoryDto){
        
        const categoryFound =  await this.categoriesResitory.findOneBy({id:id});
        if(!categoryFound){
            throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
        }
        const updatedCategory = Object.assign(categoryFound, category);
        return this.categoriesResitory.save(updatedCategory)

    }
    
    async delete(id:number){
        const categoryFound = await this.categoriesResitory.findAndCountBy({id:id});

        if(!categoryFound){
            throw new HttpException('La categoria no existe', HttpStatus.NOT_FOUND);
        }
        return this.categoriesResitory.delete(id);
    }
}

