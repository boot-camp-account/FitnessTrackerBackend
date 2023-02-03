const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [ routine ] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routine;
    
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
    SELECT users.username AS "creatorName", routines.* FROM routines;
    JOIN users ON routines."creatorId" = users.id;
    `);

    return await attachActivitiesToRoutines(routines);

  } catch (error) {
    console.error(error);
  }
}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
