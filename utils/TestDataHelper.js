import fs from 'fs';
import path from 'path';

class TestDataHelper {
   constructor() {
      const data=  require('../TestData/TestData.json');
      this.testData = data;
   }

    loadTestData() {
        console.log(this.testData);
        try {
            console.log('Loading test data from:', this.testDataPath);
            const rawData = fs.readFileSync(this.testDataPath, 'utf8');
            console.log('Raw test data:', rawData);
            this.testData = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading test data:', error);
            throw new Error('Failed to load test data');
        }
    }

    // Get test data by specific test case ID
    getTestDataById(testId) {
        const trimmedTestId = testId.trim();
        console.log('Requested test ID:', trimmedTestId);
        console.log('Available test data:', this.testData);
        if (!this.testData[trimmedTestId]) {
            throw new Error(`Test data not found for ID: ${trimmedTestId}`);
}
return this.testData[trimmedTestId];
    }

    
    // Filter tests by pattern (e.g., get all TC tests or EDGE tests)
    filterTestsByPattern(pattern) {
        const allIds = this.getAllTestIds();
        return allIds.filter(id => id.includes(pattern));
    }

    // Get multiple test data at once
    getMultipleTestData(testIds) {
        const result = {};
        testIds.forEach(id => {
            result[id] = this.getTestData(id);
        });
        return result;
    }
}

export default TestDataHelper;