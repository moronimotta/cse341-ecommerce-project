const { MongoClient } = require('mongodb');
const { initDb, getDb } = require('../data/database');

jest.mock('mongodb');

describe('Database Connection', () => {
    beforeAll((done) => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
            }),
        };

        const mockClient = { db: jest.fn().mockReturnValue(mockDb) };
        MongoClient.connect.mockResolvedValue(mockClient);
        initDb(done);
    });

    it('should initialize the database and perform an insert operation', async () => {
        const db = getDb();
        expect(db).toBeDefined();

        const collection = db.collection('test');
        await collection.insertOne({ test: 'data' });
        expect(collection.insertOne).toHaveBeenCalledWith({ test: 'data' });
    });
});