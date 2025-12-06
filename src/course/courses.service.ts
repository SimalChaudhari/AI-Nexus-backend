//courses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseEntity, CourseLevel } from './courses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(CourseEntity)
        private courseRepository: Repository<CourseEntity>,
    ) { }

    async getAll(): Promise<CourseEntity[]> {
        return await this.courseRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    async getById(id: string): Promise<CourseEntity> {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new NotFoundException("Course not found");
        }
        return course;
    }

    async create(createCourseDto: CreateCourseDto): Promise<{ message: string; course: CourseEntity }> {
        const courseData: Partial<CourseEntity> = {
            title: createCourseDto.title,
            freeOrPaid: createCourseDto.freeOrPaid ?? false,
            level: createCourseDto.level || CourseLevel.Beginner,
            amount: createCourseDto.freeOrPaid && createCourseDto.amount ? createCourseDto.amount : 0,
        };

        if (createCourseDto.description !== undefined) {
            courseData.description = createCourseDto.description;
        }

        if (createCourseDto.image !== undefined) {
            courseData.image = createCourseDto.image;
        }

        const course = this.courseRepository.create(courseData);

        await this.courseRepository.save(course);
        return {
            message: 'Course created successfully',
            course: course,
        };
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<{ message: string; course: CourseEntity }> {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Delete old file if new one is being uploaded
        if (updateCourseDto.image !== undefined && updateCourseDto.image && course.image) {
            // Only delete if it's a file path (not base64 or full URL)
            if (!course.image.startsWith('data:') && !course.image.startsWith('http')) {
                const oldFilePath = join(process.cwd(), course.image);
                if (existsSync(oldFilePath)) {
                    try {
                        await unlink(oldFilePath);
                    } catch (error) {
                        console.error('Error deleting old course image:', error);
                    }
                }
            }
        }

        // Update fields if provided
        if (updateCourseDto.title !== undefined) {
            course.title = updateCourseDto.title;
        }
        if (updateCourseDto.description !== undefined) {
            course.description = updateCourseDto.description;
        }
        if (updateCourseDto.image !== undefined) {
            // Empty string means clear the image, otherwise set the new image URL
            course.image = updateCourseDto.image === '' ? undefined : updateCourseDto.image;
        }
        if (updateCourseDto.freeOrPaid !== undefined) {
            course.freeOrPaid = updateCourseDto.freeOrPaid;
            // If switching to free, set amount to 0
            if (!updateCourseDto.freeOrPaid) {
                course.amount = 0;
            }
        }
        if (updateCourseDto.amount !== undefined) {
            course.amount = updateCourseDto.freeOrPaid ? updateCourseDto.amount : 0;
        }
        if (updateCourseDto.level !== undefined) {
            course.level = updateCourseDto.level;
        }

        await this.courseRepository.save(course);
        return {
            message: 'Course updated successfully',
            course: course,
        };
    }

    async delete(id: string): Promise<{ message: string }> {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Delete associated image file
        if (course.image) {
            // Only delete if it's a file path (not base64 or full URL)
            if (!course.image.startsWith('data:') && !course.image.startsWith('http')) {
                const imagePath = join(process.cwd(), course.image);
                if (existsSync(imagePath)) {
                    try {
                        await unlink(imagePath);
                    } catch (error) {
                        console.error('Error deleting course image:', error);
                    }
                }
            }
        }

        await this.courseRepository.remove(course);
        return { message: 'Course deleted successfully' };
    }
}

