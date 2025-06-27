import express from 'express';
import { execute_sql_query, execute_sql_query_with_params } from '../db/queries';

const router = express.Router();

//execute a read-only SQL query
router.post('/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }
    
    let result;
    
    //use the parameterized version if given params
    if (params && Array.isArray(params)) {
      result = await execute_sql_query_with_params(query, params);
    } else {
      result = await execute_sql_query(query);
    }
    
    res.json({ 
      success: true, 
      data: result,
      query: query 
    });
    
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    });
  }
});

//example queries that can be executed
router.get('/query/examples', (req, res) => {
  res.json({
    examples: [
        //basic queries
      {
        description: "Get all users",
        query: "SELECT * FROM \"User\"",
        params: []
      },
      {
        description: "Get user by email",
        query: "SELECT * FROM \"User\" WHERE email = $1",
        params: ["user@example.com"]
      },
      {
        description: "Get daily logs with user information",
        query: `
          SELECT dl.*, u.email, u.\"firstName\", u.\"lastName\" 
          FROM \"DailyLog\" dl 
          JOIN \"User\" u ON dl.\"userId\" = u.id 
          ORDER BY dl.\"createdAt\" DESC
        `,
        params: []
      },
      {
        description: "Get logs for a specific date range",
        query: "SELECT * FROM \"DailyLog\" WHERE date BETWEEN $1 AND $2",
        params: ["2024-01-01", "2024-12-31"]
      },
        //specific healthData queries
      {
        description: "Get all logs where user watched sunrise (sleep category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'sleep'->>'watchSunrise' = 'true'`,
        params: []
      },
      {
        description: "Get all logs where user consumed caffeine (nutrition category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'nutrition'->>'consumedCaffeine' = 'true'`,
        params: []
      },
      {
        description: "Get all logs where user practiced meditation (lifestyle category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'lifestyle'->>'practicedMeditation' = 'true'`,
        params: []
      },
      {
        description: "Get all logs where user felt anxious (mentalHealth category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'mentalHealth'->>'feltAnxious' = 'true'`,
        params: []
      },
      {
        description: "Get all logs where user took more than 10,000 steps (physicalHealth category)",
        query: `SELECT * FROM \"DailyLog\" WHERE (healthData->'values'->'physicalHealth'->>'stepsTakenThousands')::float > 10`,
        params: []
      },
      {
        description: "Get all logs with sleep efficiency below 80% (sleep category)",
        query: `SELECT * FROM \"DailyLog\" WHERE (healthData->'values'->'sleep'->>'sleepEfficiencyPercent')::float < 80`,
        params: []
      },
      {
        description: "Get all logs where user consumed alcohol (nutrition category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'nutrition'->>'consumedAlcohol' = 'true'`,
        params: []
      },
      {
        description: "Get all logs with notes containing the word 'migraine'",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->>'notes' ILIKE '%migraine%'`,
        params: []
      },
      {
        description: "Get all logs where user spent most of the day working (lifestyle category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'lifestyle'->>'spentMostOfDayWorking' = 'true'`,
        params: []
      },
      {
        description: "Get all logs where user felt physically recovered (physicalHealth category)",
        query: `SELECT * FROM \"DailyLog\" WHERE healthData->'values'->'physicalHealth'->>'feltPhysicallyRecovered' = 'true'`,
        params: []
      }
    ]
  });
});

export default router; 