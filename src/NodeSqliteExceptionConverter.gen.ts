// deno-fmt-ignore-file
// deno-lint-ignore-file
/**
 * Generated from https://github.com/mikro-orm/mikro-orm/blob/v6.4.13/packages/better-sqlite/src/BetterSqliteExceptionConverter.ts which is licensed as follows:
 *
 * MIT License
 *
 * Copyright (c) 2018 Martin Adámek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
import { ConnectionException, ExceptionConverter, InvalidFieldNameException, LockWaitTimeoutException, NonUniqueFieldNameException, CheckConstraintViolationException, NotNullConstraintViolationException, ReadOnlyException, SyntaxErrorException, TableExistsException, TableNotFoundException, UniqueConstraintViolationException, ForeignKeyConstraintViolationException, type Dictionary, type DriverException, } from '@mikro-orm/core';
export class NodeSqliteExceptionConverter extends ExceptionConverter {
    /* istanbul ignore next */
    /**
     * @inheritDoc
     * @link http://www.sqlite.org/c3ref/c_abort.html
     * @link https://github.com/doctrine/dbal/blob/master/src/Driver/AbstractSQLiteDriver.php
     */
    override convertException(exception: Error & Dictionary): DriverException {
        if (exception.message.includes('database is locked')) {
            return new LockWaitTimeoutException(exception);
        }
        if (exception.message.includes('must be unique') ||
            exception.message.includes('is not unique') ||
            exception.message.includes('are not unique') ||
            exception.message.includes('UNIQUE constraint failed')) {
            return new UniqueConstraintViolationException(exception);
        }
        if (exception.message.includes('may not be NULL') || exception.message.includes('NOT NULL constraint failed')) {
            return new NotNullConstraintViolationException(exception);
        }
        if (exception.message.includes('CHECK constraint failed')) {
            return new CheckConstraintViolationException(exception);
        }
        if (exception.message.includes('no such table:')) {
            return new TableNotFoundException(exception);
        }
        if (exception.message.includes('already exists')) {
            return new TableExistsException(exception);
        }
        if (exception.message.includes('no such column:')) {
            return new InvalidFieldNameException(exception);
        }
        if (exception.message.includes('ambiguous column name')) {
            return new NonUniqueFieldNameException(exception);
        }
        if (exception.message.includes('syntax error')) {
            return new SyntaxErrorException(exception);
        }
        if (exception.message.includes('attempt to write a readonly database')) {
            return new ReadOnlyException(exception);
        }
        if (exception.message.includes('unable to open database file')) {
            return new ConnectionException(exception);
        }
        if (exception.message.includes('FOREIGN KEY constraint failed')) {
            return new ForeignKeyConstraintViolationException(exception);
        }
        return super.convertException(exception);
    }
}
