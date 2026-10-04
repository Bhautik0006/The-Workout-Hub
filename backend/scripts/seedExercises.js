const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Exercise = require("../models/Exercise");

dotenv.config({ path: __dirname + "/../.env" });

const defaultExercises = [
  { name: "Barbell Bench Press", description: "A compound exercise that targets the chest, shoulders, and triceps.", muscleGroup: "Chest", equipment: "Barbell", isCustom: false },
  { name: "Incline Dumbbell Press", description: "Upper chest focused press using dumbbells.", muscleGroup: "Chest", equipment: "Dumbbell", isCustom: false },
  { name: "Cable Crossover", description: "Chest isolation movement using cable pulleys.", muscleGroup: "Chest", equipment: "Cable", isCustom: false },
  { name: "Lat Pulldown", description: "A back exercise targeting the latissimus dorsi.", muscleGroup: "Back", equipment: "Cable", isCustom: false },
  { name: "Barbell Row", description: "Compound pulling movement for back thickness and strength.", muscleGroup: "Back", equipment: "Barbell", isCustom: false },
  { name: "Pull-up", description: "Bodyweight upper body pulling exercise.", muscleGroup: "Back", equipment: "Bodyweight", isCustom: false },
  { name: "Overhead Press", description: "Standing compound press targeting the deltoids.", muscleGroup: "Shoulders", equipment: "Barbell", isCustom: false },
  { name: "Lateral Raise", description: "Isolation exercise for the lateral deltoids.", muscleGroup: "Shoulders", equipment: "Dumbbell", isCustom: false },
  { name: "Barbell Squat", description: "Foundational lower-body compound movement.", muscleGroup: "Legs", equipment: "Barbell", isCustom: false },
  { name: "Leg Press", description: "Machine-based compound leg exercise.", muscleGroup: "Legs", equipment: "Machine", isCustom: false },
  { name: "Romanian Deadlift", description: "Hip-hinge movement targeting hamstrings and glutes.", muscleGroup: "Legs", equipment: "Barbell", isCustom: false },
  { name: "Calf Raise", description: "Calf strengthening exercise on a machine or step.", muscleGroup: "Legs", equipment: "Machine", isCustom: false },
  { name: "Bicep Curl", description: "Isolation movement targeting the biceps brachii.", muscleGroup: "Arms", equipment: "Dumbbell", isCustom: false },
  { name: "Tricep Extension", description: "Cable or dumbbell tricep isolation exercise.", muscleGroup: "Arms", equipment: "Cable", isCustom: false },
  { name: "Treadmill Run", description: "Cardiovascular endurance training on a treadmill.", muscleGroup: "Cardio", equipment: "Machine", isCustom: false },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");
    
    for (const ex of defaultExercises) {
      await Exercise.findOneAndUpdate(
        { name: ex.name, isCustom: false },
        { $setOnInsert: ex },
        { upsert: true, new: true }
      );
    }
    console.log("Seeded default exercises successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
