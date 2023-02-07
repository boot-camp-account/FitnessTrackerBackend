const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  const { rows: [activity] } = await client.query(`
  INSERT INTO routine_activities("routineId", "activityId", count, duration)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `, [routineId, activityId, count, duration]);

  return activity;
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [ routine ] } = await client.query(`
    SELECT id
    FROM routine_activities
    WHERE id=${id}
    `);

    return routine;

  } catch (error) {
    console.log(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: [ routine ] } = await client.query(`
    SELECT id FROM routine_activities
    JOIN routines ON routine_activities."routineId"
    WHERE id=${id}
    `);

    return routine;

  } catch (error) {
    console.log(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ activity ] } = await client.query(`
      UPDATE routine_activities
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

async function destroyRoutineActivity(id) {
  const { rows } = await client.query(`
  DELETE FROM routine_activities
  WHERE id=$1
  RETURNING *;
  `, [id] );

 return rows
}

async function canEditRoutineActivity(routineActivityId, userId) {
  
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
