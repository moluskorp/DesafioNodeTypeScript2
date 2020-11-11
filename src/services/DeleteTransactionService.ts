import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {

    const transactionRepository = getRepository(Transaction);

    await transactionRepository.delete({ id });

    return;
  }
}

export default DeleteTransactionService;
