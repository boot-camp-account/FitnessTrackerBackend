const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [ activity ] } = await client.query(`
      INSERT INTO activities(name, description) 
      VALUES($1, $2) 
      RETURNING *;
    `, [ name, description ]);

    return activity;

  } catch (error) {
    console.log(error);
  }}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM activities;
    `);

    return rows;

  } catch (error) {
    console.error(error);
  }
}

async function getActivityById(id) {
  try {
    const { rows: [ activity ] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
    `, [id]);

    return activity;

  } catch (error) {
    console.error(error);
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [ activity ] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name=$1;
    `, [name]);

    return activity;

  } catch (error) {
    console.error(error);
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  
  const routinesWithActivities = [...routines]; 
  const routineIds = routines.map(routine => routine.id)
  const binds = routines.map((routine, index) => `$${index + 1}`).join(", ");

  // get activities related to _any_ of the routines passed in
  const { rows: activities } = await client.query(`
    SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities."routineId", 
    routine_activities.id AS "routineActivityId" FROM activities 
    JOIN routine_activities ON activities.id = routine_activities."activityId"
    WHERE routine_activities."routineId" IN (${binds})
  `, routineIds)

  // so the "from" statement determines the "primary" table 

  // loop over the routines, add a key called activities with an array of related activities
  for (let i = 0; i < routinesWithActivities.length; i++) {
    const routine = routinesWithActivities[i]
    routine.activities = activities.filter(activity => activity.routineId === routine.id)
  }

  return routinesWithActivities; 

}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity

  //spread operator/spread syntax means that you're passing in an object with an unknown amount of keys
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ activity ] } = await client.query(`
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return activity;

    // when you use the $1 placeholder, you need to use the array as a second argument in order to get the actual values and they have to be in the same order as what you're looking for

     } catch (error) {
    console.log(error);
  }
  

}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
