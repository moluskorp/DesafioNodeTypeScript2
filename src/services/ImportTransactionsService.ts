import { getRepository } from 'typeorm'
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import AppError from '../errors/AppError';

import uploadConfig from '../config/upload'
import Transaction from '../models/Transaction';

import CreateTransactionService from '../services/CreateTransactionService';

class ImportTransactionsService {
  async execute(transactionFilename: string): Promise<Transaction[]> {
    const sleep = (miliseconds: number) => {
      return new Promise(resolve => setTimeout(resolve, miliseconds));
    }

    const transactionsRepository = getRepository(Transaction);

    const readCSVStream = fs.createReadStream(transactionFilename);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions = [] as Transaction[];

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: line[2],
        category_id: line[3],
      } as Transaction

      transactions.push(transaction);
    });

    await sleep(2000);

    const createTransaction = new CreateTransactionService();

    const transactionsFinal = [] as Transaction[];

    transactions.forEach((transaction) => {
      const { title, value, type, category_id } = transaction;
      createTransaction.execute({
        title,
        value,
        type,
        category: category_id,
      }).then(e => {
        transactionsFinal.push(e);
        console.log(e);
      });
    });

    console.log(`Final: ${transactionsFinal} Fim`);

    return transactionsFinal;
  }
}

export default ImportTransactionsService;
