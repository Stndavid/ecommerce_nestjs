import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import asyncForEach = require('../utils/async_foreach');
import storage = require('../utils/cloud_storage');
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(@InjectRepository(Product) private productsRepository: Repository<Product>) {}
    

    findAll(){
        return this.productsRepository.find();

    }
    findByCategory(id_category: number){
        return this.productsRepository.findBy({id_category: id_category});

    }
    async create(files: Array<Express.Multer.File>, product: CreateProductDto) {
        console.log('Files' + files.length);
        if (files.length === 0) {
            throw new HttpException("Las imágenes son obligatorias", HttpStatus.NOT_FOUND);
        }
        let uploadedFiles = 0;
        const newProduct = this.productsRepository.create(product);
        console.log('Producto Creado', newProduct);
        const saveProduct = await this.productsRepository.save(newProduct);
        console.log('Producto guardado:', saveProduct);

        const startForEach = async () => {
            await asyncForEach(files, async (file: Express.Multer.File) => {
                const url = await storage(file, file.originalname);
                if (url !== undefined && url !== null) {
                    if (uploadedFiles === 0) {
                        saveProduct.image1 = url;
                    } else if (uploadedFiles === 1) {
                        saveProduct.image2 = url;
                    }
                }
                await this.update(saveProduct.id, saveProduct);
                uploadedFiles = uploadedFiles + 1;
            });
        };
        await startForEach();
        return saveProduct;
    }

    async updateWithImages(files: Array<Express.Multer.File>, id: number, product: UpdateProductDto) {
        console.log('Files' + files.length);
        if (files.length === 0) {
            throw new HttpException("Las imágenes son obligatorias", HttpStatus.NOT_FOUND);
        }

        // Verificación de `image_to_update`
        if (!product.image_to_update || !Array.isArray(product.image_to_update) || product.image_to_update.length === 0) {
            throw new HttpException("Las imágenes a actualizar son obligatorias", HttpStatus.BAD_REQUEST);
        }

        let counter = 0;
        let uploadedFiles = Number(product.image_to_update[counter]);

        const updatedProduct = await this.update(id, product);

        const startForEach = async () => {
            await asyncForEach(files, async (file: Express.Multer.File) => {
                const url = await storage(file, file.originalname);
                if (url !== undefined && url !== null) {
                    if (uploadedFiles === 0) {
                        updatedProduct.image1 = url;
                    } else if (uploadedFiles === 1) {
                        updatedProduct.image2 = url;
                    }
                }
                await this.update(updatedProduct.id, updatedProduct);
                counter++;
                if (counter < product.image_to_update.length) {
                    uploadedFiles = Number(product.image_to_update[counter]);
                }
            });
        };
        await startForEach();
        return updatedProduct;
    }

    async update(id: number, product: UpdateProductDto) {
        const productFound = await this.productsRepository.findOneBy({ id: id });

        if (!productFound) {
            throw new HttpException("Producto no encontrado", HttpStatus.NOT_FOUND);
        }
        const updatedProduct = Object.assign(productFound, product);
        return this.productsRepository.save(updatedProduct);
    }
    async delete(id: number) {
        const productFound = await this.productsRepository.findOneBy({ id: id });

        if (!productFound) {
            throw new HttpException("Producto no encontrado", HttpStatus.NOT_FOUND);
        }
        
        return this.productsRepository.delete(id);
    }
}
