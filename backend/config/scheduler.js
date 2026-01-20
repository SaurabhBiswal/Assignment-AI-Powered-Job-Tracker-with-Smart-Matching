import cron from 'node-cron';
import { internalFetchAndSaveMockJobs } from '../controller/jobController.js';

const initScheduler = () => {
    
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Automatic Job Fetch (Mock)...');
        try {
            const result = await internalFetchAndSaveMockJobs();
            console.log('Job Fetch Success:', result);
        } catch (error) {
            console.error('Job Fetch Failed:', error.message);
        }
    });

    console.log("Job Scheduler Initialized: running daily at 00:00.");
};

export default initScheduler;
