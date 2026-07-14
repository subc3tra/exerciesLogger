import { PrismaClient, ExerciseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// EXERCISE DATA — append new entries here over time, never delete old ones.
// Pull the first batch straight out of mattias.program.ts / miAmor.program.ts.
// ============================================================================
const EXERCISES: {
  name: string;
  category: ExerciseCategory;
  description?: string;
  link?: string;
}[] = [
  // CHEST
  { name: 'Bench Press', category: 'CHEST', description: 'Barbell bench press performed flat, targeting the pectorals, anterior deltoids, and triceps. Set up with shoulder-blade retraction and a slight arch; lower the bar to mid-chest with control before pressing. A foundational horizontal push movement.' },
  { name: 'Close-Grip Bench Press', category: 'CHEST', description: 'Barbell bench press with a narrower grip (roughly shoulder-width), shifting emphasis toward the triceps while still engaging the chest and anterior deltoid. Keep elbows closer to the body than a standard bench press to protect the wrists and maximize tricep recruitment.' },
  { name: 'Incline Dumbbell Chest Press', category: 'CHEST', description: 'Dumbbell press on a bench set to approximately 30 degrees, with palms facing each other. The incline angle increases upper chest and anterior deltoid involvement; neutral grip reduces shoulder stress compared to a pronated grip.' },
  { name: 'Cable Chest Press', category: 'CHEST', description: 'Unilateral or bilateral horizontal press using a cable machine, typically set at chest height. Provides constant tension throughout the range of motion, making it effective for chest hypertrophy with less joint loading than a barbell.' },

  // BACK
  { name: 'Deadlift', category: 'BACK', description: 'Conventional barbell deadlift from the floor, training the entire posterior chain — erectors, glutes, hamstrings, and upper back. Brace hard, maintain a neutral spine, and drive the floor away rather than pulling the bar up.' },
  { name: 'Sumo Deadlift', category: 'BACK', description: 'Deadlift variation with a wide stance and toes pointed outward, reducing the range of motion and shifting some load from the lower back to the hips and inner thighs. Technically demanding hip-hinge pattern; well-suited for individuals with longer torsos or hip anatomy that limits conventional pulling.' },
  { name: 'Zercher Deadlift', category: 'BACK', description: 'Deadlift with the bar held in the crook of the elbows rather than the hands, creating a more upright torso angle and high core demand. Trains the posterior chain similarly to a conventional deadlift but with greater anterior core and upper back involvement.' },
  { name: 'Romanian Deadlift', category: 'BACK', description: 'Hip-hinge movement starting from standing, lowering the bar along the legs while maintaining a slight knee bend and neutral spine. Primarily targets the hamstrings and glutes through a loaded stretch; does not touch the floor between reps.' },
  { name: 'Lat Pulldown', category: 'BACK', description: 'Cable machine exercise pulling a wide or neutral-grip bar down to the upper chest, targeting the latissimus dorsi and biceps. Focus on driving the elbows down and back rather than pulling with the hands to maximize lat engagement.' },
  { name: 'Seated Cable Row', category: 'BACK', description: 'Horizontal pull on a cable machine with a neutral or pronated grip, seated with knees slightly bent. Targets the mid-back (rhomboids, mid-traps, and lats) and biceps. Keep the torso upright and avoid using momentum.' },
  { name: 'Low Cable Row', category: 'BACK', description: 'Horizontal cable row with a low pulley attachment, performed with a straight back and minimal torso movement. Distinguished from a seated cable row by its setup angle and handle position, emphasizing a slightly different pull angle on the lower lats and mid-back.' },
  { name: 'Single-Arm Dumbbell Row', category: 'BACK', description: 'Unilateral row with one knee and hand braced on a bench, pulling a dumbbell from a hanging position to the hip. Allows a large range of motion and heavy loading; targets the lats, rhomboids, and rear deltoid with reduced compensation from the opposite side.' },
  { name: 'Back Extension', category: 'BACK', description: 'Hyperextension movement performed on a back extension bench or GHD, training the erector spinae, glutes, and hamstrings. Can be loaded with a plate or kept bodyweight; hinge at the hips rather than rounding the spine.' },
  { name: 'Nordic Curl', category: 'BACK', description: 'Eccentric-dominant hamstring exercise where the feet are anchored and the body lowers toward the floor under control. One of the most effective exercises for hamstring injury prevention; extremely demanding — beginners typically need bands for assistance.' },

  // LEGS
  { name: 'Barbell Squat', category: 'LEGS', description: 'Hip-width barbell back squat, the cornerstone lower-body strength movement targeting quads, glutes, and adductors. Brace the core, sit into the hips, and drive the knees out over the toes; depth should reach at least parallel.' },
  { name: 'Front Squat', category: 'LEGS', description: 'Barbell squat with the bar racked on the front deltoids, requiring a more upright torso than a back squat. Demands significant thoracic mobility and wrist flexibility; heavily loads the quads and places less shear on the lower back.' },
  { name: 'Goblet Squat', category: 'LEGS', description: 'Squat variation holding a kettlebell or dumbbell at chest height, naturally promoting an upright torso and good squat mechanics. Excellent for building a squat pattern in beginners or as a warm-up/accessory for experienced lifters.' },
  { name: 'Zercher Squat', category: 'LEGS', description: 'Squat with the barbell held in the crook of the elbows, forcing an upright posture and high core tension throughout. Builds significant anterior core and upper back strength alongside quad and glute development; easier on the wrists than a front squat.' },
  { name: 'Bulgarian Split Squat', category: 'LEGS', description: "Rear-foot elevated split squat targeting the front leg's quad and glute. Balance demands are high; load with dumbbells or a barbell. Rear foot elevation increases the range of motion and hip flexor stretch on the back leg." },
  { name: 'Hip Thrust', category: 'LEGS', description: 'Loaded glute bridge with the upper back on a bench and a barbell across the hips. One of the most effective exercises for glute development through hip extension. Drive through the heels and squeeze hard at the top; keep the chin tucked.' },
  { name: 'Leg Extension', category: 'LEGS', description: 'Isolation exercise for the quadriceps performed on a machine, extending the knee against resistance. Useful for quad hypertrophy and rehab contexts; avoid excessive load if there is existing knee discomfort.' },
  { name: 'Lying Leg Curl', category: 'LEGS', description: 'Hamstring isolation exercise performed prone on a machine, curling the heels toward the glutes. Trains the hamstrings through knee flexion; complement with hip-dominant exercises (RDL, Nordic curl) for full hamstring development.' },
  { name: 'Standing Calf Raise', category: 'LEGS', description: 'Isolation movement for the gastrocnemius and soleus, pressing through the balls of the feet to full plantarflexion. Train through a full range of motion including a deep stretch at the bottom; can be performed on a machine, step, or with a barbell.' },
  { name: 'Dumbbell Step-Up', category: 'LEGS', description: 'Unilateral lower-body exercise stepping onto a box or bench with dumbbells, targeting the quad and glute of the working leg. Step height determines difficulty and hip angle; avoid pushing off the trailing foot.' },
  { name: 'Cable Hip Abduction', category: 'LEGS', description: 'Standing hip abduction using a low cable attachment, isolating the glutes (primarily gluteus medius) and hip abductors. Keep the torso upright and control the return to avoid compensating with the lower back.' },
  { name: 'Banded Lateral Walk', category: 'LEGS', description: 'Lateral stepping with a resistance band around the ankles or knees, activating the glute medius and hip abductors. Commonly used in warm-ups and rehab; maintain a slight squat position and level hips throughout.' },
  { name: 'Banded Clamshells', category: 'LEGS', description: 'Side-lying hip external rotation with a resistance band above the knees. Isolates the glute medius and external rotators; commonly used in warm-ups and injury prevention programs for the hip and knee.' },

  // SHOULDERS
  { name: 'Overhead Press', category: 'SHOULDERS', description: 'Standing overhead barbell press targeting the deltoids, triceps, and upper pectorals, with significant core and full-body stabilization demand. Press the bar in a straight vertical path; squeeze glutes and brace the core to avoid lumbar hyperextension.' },
  { name: 'Dumbbell Shoulder Press', category: 'SHOULDERS', description: 'Overhead dumbbell press performed seated or standing, training the deltoids and triceps with independent arm movement. Dumbbells allow a more natural pressing path and expose side-to-side strength imbalances.' },
  { name: 'Lateral Raises', category: 'SHOULDERS', description: 'Dumbbell or cable raise moving the arms out to the sides to approximately shoulder height, isolating the lateral deltoid. Keep a slight bend in the elbows and avoid shrugging; lean slightly forward to improve deltoid targeting.' },
  { name: 'Face Pulls', category: 'SHOULDERS', description: 'Cable exercise pulling a rope attachment toward the face with the elbows high and out, targeting the rear deltoids, external rotators, and mid-traps. A key exercise for shoulder health and postural balance when pressing volume is high.' },
  { name: 'Rear Delt Fly', category: 'SHOULDERS', description: 'Isolation movement for the posterior deltoid and rhomboids, performed with dumbbells (bent-over or incline) or a cable machine. Keep a neutral spine and lead with the elbows to maximize rear delt recruitment over the traps.' },

  // ARMS
  { name: 'Barbell Bicep Curl', category: 'ARMS', description: 'Standard barbell or dumbbell curl targeting the biceps and brachialis. Keep the elbows fixed at the sides and avoid swinging; a full range of motion including the bottom stretch maximizes hypertrophy stimulus.' },
  { name: 'Dumbbell Bicep Curl', category: 'ARMS', description: 'Unilateral or bilateral dumbbell curl allowing supination through the range of motion to fully engage the biceps. Dumbbells expose left-right strength imbalances and allow a natural wrist rotation compared to a fixed barbell grip.' },
  { name: 'Skull Crusher', category: 'ARMS', description: 'Lying tricep extension with a barbell or EZ-bar, lowering the weight toward the forehead by hinging at the elbows. Targets the long head of the triceps effectively; keep the elbows stable and pointed toward the ceiling throughout.' },
  { name: 'Triceps Pushdown', category: 'ARMS', description: 'Cable pushdown with a bar or rope attachment, isolating the triceps through elbow extension. The rope variant allows the hands to separate at the bottom for a stronger contraction; keep the elbows pinned to the sides.' },

  // CORE
  { name: 'Deadbug', category: 'CORE', description: 'Supine core stability exercise alternately lowering opposite arm and leg while maintaining a flat lower back against the floor. Trains deep anterior core (transverse abdominis) and anti-extension strength; slow and controlled reps are more effective than speed.' },
  { name: 'Pallof Press', category: 'CORE', description: 'Anti-rotation core exercise using a cable or band anchored to the side, pressing the handle away from the chest and resisting rotation. Effective for building lateral core stability and oblique strength; the farther the attachment from the body, the harder the anti-rotation demand.' },
  { name: '90/90 Hip Rotation', category: 'CORE', description: 'Mobility drill in a seated 90/90 position rotating the pelvis and hips to transition between internal and external rotation. Targets hip joint mobility and the deep hip rotators; commonly used in warm-ups or between heavy compound sets.' },
  { name: 'Hip CARs (Controlled Articular Rotations)', category: 'CORE', description: 'Active mobility exercise moving the hip through its full available range of motion in a controlled circle. Used to build and maintain hip mobility and neuromuscular control; typically performed on hands and knees, keeping the spine still.' },
  { name: 'KB Swing', category: 'CORE', description: 'Hip-hinge power exercise with a kettlebell, driving through the glutes and hamstrings to project the bell forward. Trains explosive hip extension, posterior chain strength, and anti-flexion core stability; technique is critical — this is a hinge, not a squat.' },

  // CARDIO
  { name: 'Rowing Machine', category: 'CARDIO', description: 'Full-body cardiovascular exercise on an ergometer, engaging the legs, core, and upper body in sequence. Low impact on the joints; excellent for conditioning and active recovery. Drive with the legs first, then lean back and pull the handle to the lower chest.' },
  { name: 'Stationary Bike', category: 'CARDIO', description: 'Low-impact cardiovascular exercise performed on an upright or recumbent stationary bike. Allows sustained aerobic work with minimal joint stress; useful as a warm-up, LISS, or interval training tool.' },
  { name: 'Treadmill', category: 'CARDIO', description: 'Walking or running on a motorized belt at a controlled speed and incline. Versatile for warm-ups, steady-state cardio, or interval sessions; incline walking is a joint-friendly alternative to running for lower-body conditioning.' },
  { name: 'Stepmaster / Stairclimber', category: 'CARDIO', description: 'Cardiovascular machine simulating stair climbing, loading the glutes, quads, and calves while elevating the heart rate. Higher glute recruitment than flat walking; intensity can be adjusted by speed and step height.' },
];

// ============================================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================================
async function main() {
  let created: number = 0;
  let skipped: number = 0;
  for (const ex of EXERCISES) {
    const exists = await prisma.exercise.findFirst({
      where: { userId: null, name: { equals: ex.name, mode : 'insensitive'} }
    });
    if (exists) {
      skipped ++;
      continue;
    } else {
      await prisma.exercise.create({
        data: {
          ...ex,
          userId: null,
          // same category-based default the migration backfill used
          trackedFields: ex.category === 'CARDIO' ? ['DURATION', 'DISTANCE'] : ['REPS', 'WEIGHT'],
        },
      });
      created++;
    }
  }
  console.log(`created: ${created}, skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());