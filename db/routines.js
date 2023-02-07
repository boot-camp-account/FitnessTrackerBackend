const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [ routine ]  } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routine;
    
  } catch (error) {
    console.log(error);
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [ routine ] } = await client.query(`
    SELECT id
    FROM routines
    WHERE id=${id}
    `);

    return routine;

  } catch (error) {
    console.log(error);
  }
}

async function getRoutinesWithoutActivities() {}

async function getAllRoutines() {
    const { rows: routines } = await client.query(`
    SELECT users.username AS "creatorName", routines.* FROM routines
    JOIN users ON routines."creatorId" = users.id;
    `)

    return await attachActivitiesToRoutines(routines)

}

async function getAllPublicRoutines() {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE "isPublic"=true;
`);

  return await attachActivitiesToRoutines(rows);
}

async function getAllRoutinesByUser({ username }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE username=$1;
  `, [username])

  return await attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByUser({ username }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE username=$1 AND "isPublic"=true;
  `, [username])

  return await attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  JOIN routine_activities ON routines.id = routine_activities."routineId"
  WHERE "activityId"=$1 AND "isPublic"=true;
  `, [id])

  return await attachActivitiesToRoutines(rows);
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ routine ] } = await client.query(`
      UPDATE routines
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return routine;

  // when you use the $1 placeholder, you need to use the array as a second argument in order to get the actual values and they have to be in the same order as what you're looking for

   } catch (error) {
  console.log(error);
}

}

async function destroyRoutine(id) {
   const { rows } = await client.query(`
   DELETE FROM routines
   WHERE id=$1
   RETURNING *;
   `, [id] );

  return rows
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
