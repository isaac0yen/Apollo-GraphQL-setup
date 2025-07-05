// This class is a wrapper for the mysql library, providing methods to start, commit and rollback transactions,
// as well as methods to insert, update, delete and select rows from the database.
// It also provides methods to backup the entire database to a local file or a remote ftp directory.

// list of methods provided by the _MySQL class along with short instructions for developers:

// transaction()
// Description: Starts a database transaction.
// Usage: Call this method before a series of database operations that should be treated as a single transaction.

// commit()
// Description: Commits the current transaction.
// Usage: Call this method after successfully completing a series of database operations within a transaction.

// rollback()
// Description: Rolls back the current transaction.
// Usage: Call this method if an error occurs during a transaction, undoing any changes made within the transaction.

// query(sql: string)
// Description: Executes a custom SQL query on the database.
// Usage: Pass a valid SQL query string as an argument. Returns the result of the query.

// insertOne(tableName: string, data: object)
// Description: Inserts a single row into the specified table.
// Usage: Provide the table name and an object containing the data to be inserted. Returns the ID of the inserted row.

// insertMany(tableName: string, data: array)
// Description: Inserts multiple rows into the specified table.
// Usage: Provide the table name and an array of objects, each representing data for a row.
// Returns the number of affected rows.

// updateOne(tableName: string, data: object, condition: object)
// Description: Updates a single row in the specified table based on a given condition.
// Usage: Provide the table name, data to be updated, and a condition to identify the row. Returns the number of affected rows.

// updateMany(tableName: string, data: object, condition: object)
// Description: Updates multiple rows in the specified table based on a given condition.
// Usage: Provide the table name, data to be updated, and a condition to identify rows. Returns the number of affected rows.

// updateDirect(query: string, params: object)
// Description: Executes a custom update query directly on the database.
// Usage: Provide a valid update SQL query and parameters. Returns the number of affected rows.

// deleteOne(tableName: string, condition: object)
// Description: Deletes a single row from the specified table based on a given condition.
// Usage: Provide the table name and a condition to identify the row to be deleted. Returns the number of affected rows.

// deleteMany(tableName: string, condition: object)
// Description: Deletes multiple rows from the specified table based on a given condition.
// Usage: Provide the table name and a condition to identify rows to be deleted. Returns the number of affected rows.

// deleteDirect(query: string, condition: object)
// Description: Executes a custom delete query directly on the database.
// Usage: Provide a valid delete SQL query and parameters. Returns the number of affected rows.

// findOne(tableName: string, condition: object, options: object)
// Description: Retrieves a single row from the specified table based on a given condition.
// Usage: Provide the table name, condition, and optional parameters like columns and useIndex. Returns the selected row.

// findMany(tableName: string, condition: object, options: object)
// Description: Retrieves multiple rows from the specified table based on a given condition.
// Usage: Provide the table name, condition, and optional parameters like columns and useIndex. Returns an array of selected rows.

// findDirect(query: string, condition: object)
// Description: Executes a custom select query directly on the database.
// Usage: Provide a valid select SQL query and parameters. Returns an array of selected rows.

// upsertOne(tableName: string, data: object)
// Description: Inserts or updates a single row into the specified table (based on a unique key).
// Usage: Provide the table name and an object containing the data. Returns the number of affected rows.

// upsertMany(tableName: string, data: array)
// Description: Inserts or updates multiple rows into the specified table (based on a unique key).
// Usage: Provide the table name and an array of objects, each representing data for a row. Returns the number of affected rows.

// insertIgnoreOne(tableName: string, data: object)
// Description: Inserts a single row into the specified table, ignoring duplicates.
// Usage: Provide the table name and an object containing the data. Returns the number of affected rows.

// insertIgnoreMany(tableName: string, data: array)
// Description: Inserts multiple rows into the specified table, ignoring duplicates.
// Usage: Provide the table name and an array of objects, each representing data for a row. Returns the number of affected rows.

// executeDirect(query: string)
// Description: Executes a custom SQL query directly on the database without expecting any specific result.
// Usage: Provide a valid SQL query for execution.

// Import dotenv to load environment variables
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from '../settings/config'
import 'dotenv/config';
import { Pool, createPool } from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2';

type DBRow = RowDataPacket[];
type DBObject = RowDataPacket;
type DBResult = ResultSetHeader & { insertId?: number };
type DBRowOrObject = DBRow | DBObject | undefined;

type OptionType = {
  useIndex?: string;
  columns?: string;
};

type ObjectType = Record<string, unknown>;

let _DB: Pool;

export const DBConnect = async () => {
  try {
    _DB = await createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      namedPlaceholders: true,
      waitForConnections: true,
      connectionLimit: 120,
      maxIdle: 50,
      idleTimeout: 300000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      dateStrings: true,
    });

    const connection = await _DB.getConnection();
    connection.release();

    console.log(
      'New MySQL Connection pool created successfully. ',
      process.env.DB_DATABASE,
    );
  } catch (error) {
    console.log('New MySQL Database connection failed:', error.message);
    throw error;
  }
};

export const db = {
  async transaction(): Promise<void> {
    const query = 'START TRANSACTION';
    await _DB.query(query);
  },

  async commit(): Promise<void> {
    const query = 'COMMIT';
    await _DB.query(query);
  },

  async rollback(): Promise<void> {
    const query = 'ROLLBACK';
    await _DB.query(query);
  },

  async query(sql: string): Promise<DBRow> {
    if (sql === '') {
      throw new Error('Query is empty');
    }
    try {
      const [results]: [DBRow, FieldPacket[]] = await _DB.query(sql);
      return results;
    } catch (err) {
      throw new Error('Query Error.');
    }
  },

  async insertOne(tableName: string, data: ObjectType): Promise<number> {
    const columns = '`' + Object.keys(data).join('`,`') + '`';
    const placeholders = Object.keys(data)
      .map((col) => ':' + col)
      .join(',');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(query, data);
    return result.insertId || 0;
  },

  async insertMany(tableName: string, data: ObjectType[]): Promise<number> {
    const columns = '`' + Object.keys(data[0]).join('`,`') + '`';
    const values: unknown[][] = data.map((row) => Object.values(row));
    const query = `INSERT INTO ${tableName} (${columns}) VALUES ?;`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.query(query, [
      values,
    ]);
    return result.affectedRows;
  },

  async updateOne(
    tableName: string,
    data: ObjectType,
    condition: ObjectType,
  ): Promise<number> {
    const set = Object.keys(data)
      .map((col) => '`' + col + '` = :' + col)
      .join(', ');
    const allData = { ...data };
    let query = '';

    if (condition && Object.keys(condition).length > 0) {
      const where = Object.keys(condition)
        .map((col) => {
          allData['w_' + col] = condition[col];
          return col + ' = :w_' + col;
        })
        .join(' AND ');
      query = `UPDATE ${tableName} SET ${set} WHERE ${where} LIMIT 1`;
    } else {
      query = `UPDATE ${tableName} SET ${set} LIMIT 1`;
    }

    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      allData,
    );
    return result.affectedRows;
  },

  async updateMany(
    tableName: string,
    data: ObjectType,
    condition: ObjectType,
  ): Promise<number> {
    const set = Object.keys(data)
      .map((col) => '`' + col + '` = :' + col)
      .join(', ');
    const allData = { ...data };
    let query = '';

    if (condition && Object.keys(condition).length > 0) {
      const where = Object.keys(condition)
        .map((col) => {
          allData['w_' + col] = condition[col];
          return col + ' = :w_' + col;
        })
        .join(' AND ');
      query = `UPDATE ${tableName} SET ${set} WHERE ${where}`;
    } else {
      query = `UPDATE ${tableName} SET ${set}`;
    }

    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      allData,
    );
    return result.affectedRows;
  },

  async updateDirect(query: string, params?: ObjectType): Promise<number> {
    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      params,
    );
    return result.affectedRows;
  },

  async deleteOne(tableName: string, condition: ObjectType): Promise<number> {
    let query = '';

    if (condition && Object.keys(condition).length > 0) {
      const where = Object.keys(condition)
        .map((col) => '`' + col + '` = :' + col)
        .join(' AND ');
      query = `DELETE FROM ${tableName} WHERE ${where} LIMIT 1`;
    } else {
      query = `DELETE FROM ${tableName} LIMIT 1`;
    }

    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      condition,
    );
    return result.affectedRows;
  },

  async deleteMany(tableName: string, condition: ObjectType): Promise<number> {
    let query = '';

    if (condition && Object.keys(condition).length > 0) {
      const where = Object.keys(condition)
        .map((col) => '`' + col + '` = :' + col)
        .join(' AND ');
      query = `DELETE FROM ${tableName} WHERE ${where}`;
    } else {
      query = `DELETE FROM ${tableName}`;
    }

    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      condition,
    );
    return result.affectedRows;
  },

  async deleteDirect(query: string, condition?: ObjectType): Promise<number> {
    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(
      query,
      condition,
    );
    return result.affectedRows;
  },

  async findOne(
    tableName: string,
    condition?: ObjectType,
    options?: OptionType,
  ): Promise<DBObject | undefined> {
    let columns = '*';
    if (options?.columns && options.columns.length > 0) {
      columns = options.columns;
    }

    if (condition && Object.keys(condition).length > 0) {
      let myIndex = '';
      if (options?.useIndex && options.useIndex.length > 1) {
        myIndex = ` USE INDEX (${options.useIndex}) `;
      }

      const placeholders = Object.keys(condition)
        .map((col) => '`' + col + '` = :' + col)
        .join(' AND ');
      const query = `SELECT ${columns} FROM ${tableName} ${myIndex} WHERE ${placeholders} LIMIT 1`;
      const [result]: [DBRow, FieldPacket[]] = await _DB.execute(
        query,
        condition,
      );
      return result[0];
    } else {
      const query = `SELECT ${columns} FROM ${tableName} LIMIT 1`;
      const [result]: [DBRow, FieldPacket[]] = await _DB.execute(query);
      return result[0];
    }
  },

  async findMany(
    tableName: string,
    condition?: ObjectType,
    options?: OptionType,
  ): Promise<DBRow> {
    let columns = '*';
    if (options?.columns && options.columns.length > 0) {
      columns = options.columns;
    }

    if (condition && Object.keys(condition).length > 0) {
      let myIndex = '';
      if (options?.useIndex && options.useIndex.length > 1) {
        myIndex = ` USE INDEX (${options.useIndex}) `;
      }

      const placeholders = Object.keys(condition)
        .map((col) => '`' + col + '` = :' + col)
        .join(' AND ');
      const query = `SELECT ${columns} FROM ${tableName} ${myIndex} WHERE ${placeholders}`;
      const [result]: [DBRow, FieldPacket[]] = await _DB.execute(
        query,
        condition,
      );
      return result;
    } else {
      const query = `SELECT ${columns} FROM ${tableName}`;
      const [result]: [DBRow, FieldPacket[]] = await _DB.execute(query);
      return result;
    }
  },

  async find(
    tableName: string,
    condition?: ObjectType,
  ): Promise<DBRowOrObject> {
    const placeholders = condition
      ? Object.keys(condition)
          .map((col) => '`' + col + '` = :' + col)
          .join(' AND ')
      : '1';
    const query = `SELECT * FROM ${tableName} WHERE ${placeholders}`;
    const [result]: [DBRow, FieldPacket[]] = await _DB.execute(
      query,
      condition,
    );
    return result.length === 1 ? result[0] : result;
  },
  async findDirect(query: string, condition?: ObjectType): Promise<DBRow[]> {
    const [rows]: [DBRow[], FieldPacket[]] = await _DB.execute(
      query,
      condition,
    );
    return rows;
  },

  async upsertOne(tableName: string, data: ObjectType): Promise<number> {
    const columns = '`' + Object.keys(data).join('`,`') + '`';
    const placeholders = Object.keys(data)
      .map((col) => ':' + col)
      .join(',');
    const query = `REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(query, data);
    return result.affectedRows;
  },

  async upsertMany(tableName: string, data: ObjectType[]): Promise<number> {
    const columns = '`' + Object.keys(data[0]).join('`,`') + '`';
    const values: unknown[][] = data.map((row) => Object.values(row));
    const query = `REPLACE INTO ${tableName} (${columns}) VALUES ?;`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.query(query, [
      values,
    ]);
    return result.affectedRows;
  },

  async insertIgnoreOne(tableName: string, data: ObjectType): Promise<number> {
    const columns = '`' + Object.keys(data).join('`,`') + '`';
    const placeholders = Object.keys(data)
      .map((col) => ':' + col)
      .join(',');
    const query = `INSERT IGNORE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.execute(query, data);
    return result.affectedRows;
  },

  async insertIgnoreMany(
    tableName: string,
    data: ObjectType[],
  ): Promise<number> {
    const columns = '`' + Object.keys(data[0]).join('`,`') + '`';
    const values: unknown[][] = data.map((row) => Object.values(row));
    const query = `INSERT IGNORE INTO ${tableName} (${columns}) VALUES ?;`;
    const [result]: [DBResult, FieldPacket[]] = await _DB.query(query, [
      values,
    ]);
    return result.affectedRows;
  },

  async executeDirect(query: string): Promise<void> {
    await _DB.execute(query);
  },
};
