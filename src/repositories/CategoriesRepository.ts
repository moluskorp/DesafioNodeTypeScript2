import Category from '../models/Category';
import { EntityRepository, Repository } from 'typeorm';

interface Request {
  title: string;
}

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category>{
  public async getCategory({ title }: Request): Promise<Category> {
    const findCategory = await this.findOne({
      where: { title },
    });
    if (!findCategory) {
      const category = { title };
      const createdCategory = this.create(category);
      return createdCategory;
    }
    return findCategory;
  }
}

export default CategoriesRepository;
