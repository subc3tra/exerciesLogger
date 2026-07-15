import { PrismaClient, ExerciseCategory, TrackField } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// EXERCISE DATA — this array is the source of truth. Edit docs/exercise-list.md
// first, then mirror the change here, then run this script against whichever
// environment needs it. Safe to rerun anytime, anywhere — matches by name
// (case-insensitive) and updates in place rather than duplicating.
// ============================================================================
const EXERCISES: {
  name: string;
  category: ExerciseCategory;
  description?: string;
  link?: string;
  trackedFields?: TrackField[]; // omit to use the category default below
}[] = [
  // CHEST
  { name: 'Bench Press', category: 'CHEST', description: 'Barbell bench press performed flat, targeting the pectorals, anterior deltoids, and triceps. Set up with shoulder-blade retraction and a slight arch; lower the bar to mid-chest with control before pressing. A foundational horizontal push movement.' },
  { name: 'Close-Grip Bench Press', category: 'CHEST', description: 'Barbell bench press with a narrower grip (roughly shoulder-width), shifting emphasis toward the triceps while still engaging the chest and anterior deltoid. Keep elbows closer to the body than a standard bench press to protect the wrists and maximize tricep recruitment.' },
  { name: 'Incline Dumbbell Chest Press', category: 'CHEST', description: 'Dumbbell press on a bench set to approximately 30 degrees, with palms facing each other. The incline angle increases upper chest and anterior deltoid involvement; neutral grip reduces shoulder stress compared to a pronated grip.' },
  { name: 'Cable Chest Press', category: 'CHEST', description: 'Unilateral or bilateral horizontal press using a cable machine, typically set at chest height. Provides constant tension throughout the range of motion, making it effective for chest hypertrophy with less joint loading than a barbell.' },
  { name: 'Scapular Push Up', category: 'CHEST', description: 'Bodyweight movement performed from a push-up or plank position, moving only through the shoulder blades — elbows stay locked while the scapula protracts and retracts. Isolates the serratus anterior and lower trapezius; commonly used as a warm-up or corrective drill to build scapular control and shoulder stability, especially useful for overhead athletes or as injury-prevention work.' },
  { name: 'Dips', category: 'CHEST', description: 'Bodyweight or weighted dip performed on parallel bars, lowering the body until the upper arms are roughly parallel to the floor before pressing back up. Leaning the torso forward shifts emphasis toward the chest and front deltoids; staying upright targets the triceps more directly.' },

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
  { name: 'Chin-Up', category: 'BACK', description: 'Bodyweight pull-up performed with an underhand (supinated) grip, emphasizing the lats and biceps more than a standard overhand pull-up. Pull until the chin clears the bar; add weight via a dip belt once bodyweight reps are no longer challenging.' },
  { name: 'Shrugs', category: 'BACK', description: 'Barbell or dumbbell shrug lifting the shoulders straight up toward the ears to target the upper trapezius. Avoid rolling the shoulders — a straight vertical path keeps tension on the traps and reduces shoulder-joint strain.' },

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
  { name: 'Leg Press', category: 'LEGS', description: 'Machine-based compound leg exercise pressing a weighted platform away from the body while seated in a reclined position. Allows heavy loading of the quads and glutes with less spinal loading and balance demand than a free-weight squat.' },
  { name: 'Seated Leg Curl', category: 'LEGS', description: 'Hamstring isolation exercise performed seated on a machine, curling the lower legs down and back against resistance. The seated angle changes hip position relative to a lying leg curl, shifting the stretch and loading slightly higher in the hamstring.' },
  { name: 'Sled Push/Pull', category: 'LEGS', description: 'Loaded sled driven forward (push) or dragged backward (pull) across a set distance, combining leg drive with a significant conditioning demand. Low eccentric loading makes it a joint-friendly way to build leg power and work capacity; distance and added weight are both easy to progress.', trackedFields: ['DISTANCE', 'WEIGHT'] },
  { name: 'Terminal Knee Extension', category: 'LEGS', description: 'Banded knee extension performed through only the final few degrees of extension, using a resistance band anchored behind the knee. Isolates the VMO (vastus medialis oblique); a staple rehab exercise after knee injury or surgery since it avoids loading the joint through a full range of motion.' },
  { name: 'Seated Calf Raise', category: 'LEGS', description: 'Isolation movement for the soleus performed seated with the knee bent, pressing through the balls of the feet against a pad or machine. The bent-knee position takes the gastrocnemius largely out of play compared to a standing calf raise, shifting emphasis to the soleus — gentler on the knee joint too.' },
  { name: 'Single-Leg Glute Bridge', category: 'LEGS', description: "Unilateral bodyweight glute bridge — one foot planted, hips driven up while the other leg stays extended or lifted. Bodyweight-only counterpart to the Hip Thrust, useful when heavy spinal or hip loading isn't appropriate; also exposes left-right glute imbalances." },
  { name: 'Side-Lying Hip Abduction', category: 'LEGS', description: 'Side-lying leg raise lifting the top leg straight up against gravity or a band, isolating the hip abductors and gluteus medius. Low-load, joint-friendly way to build hip stability — commonly used in rehab and warm-ups.' },
  { name: 'Copenhagen Adductor', category: 'LEGS', description: "Side plank variation with the top leg supported on a bench, training the hip adductors through an isometric or dynamic hold. The modified/regressed version supports the top leg closer to the knee rather than the ankle, shortening the lever arm for a knee-friendlier entry point." },

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
  { name: 'Hammer Curl', category: 'ARMS', description: 'Dumbbell curl performed with a neutral (palms-facing-in) grip throughout, shifting emphasis toward the brachialis and brachioradialis alongside the biceps. The neutral grip is also easier on the wrists than a standard curl for lifters with wrist discomfort.' },

  // CORE
  { name: 'Deadbug', category: 'CORE', description: 'Supine core stability exercise alternately lowering opposite arm and leg while maintaining a flat lower back against the floor. Trains deep anterior core (transverse abdominis) and anti-extension strength; slow and controlled reps are more effective than speed.' },
  { name: 'Pallof Press', category: 'CORE', description: 'Anti-rotation core exercise using a cable or band anchored to the side, pressing the handle away from the chest and resisting rotation. Effective for building lateral core stability and oblique strength; the farther the attachment from the body, the harder the anti-rotation demand.' },
  { name: '90/90 Hip Rotation', category: 'CORE', description: 'Mobility drill in a seated 90/90 position rotating the pelvis and hips to transition between internal and external rotation. Targets hip joint mobility and the deep hip rotators; commonly used in warm-ups or between heavy compound sets.' },
  { name: 'Hip CARs (Controlled Articular Rotations)', category: 'CORE', description: 'Active mobility exercise moving the hip through its full available range of motion in a controlled circle. Used to build and maintain hip mobility and neuromuscular control; typically performed on hands and knees, keeping the spine still.' },
  { name: 'KB Swing', category: 'CORE', description: 'Hip-hinge power exercise with a kettlebell, driving through the glutes and hamstrings to project the bell forward. Trains explosive hip extension, posterior chain strength, and anti-flexion core stability; technique is critical — this is a hinge, not a squat.' },
  { name: 'Farmers Carry', category: 'CORE', description: 'Loaded carry holding a heavy weight in each hand while walking a set distance, training grip, trunk stability, and total-body tension under load. Keep the ribcage stacked over the pelvis and avoid leaning to either side.', trackedFields: ['DISTANCE', 'WEIGHT'] },
  { name: 'Plank', category: 'CORE', description: 'Isometric hold in a forearm or high-plank position, bracing the core to keep a straight line from shoulders to ankles. A foundational anti-extension exercise for core stability; hold duration is the primary progression.', trackedFields: ['DURATION'] },
  { name: 'Cable Crunch', category: 'CORE', description: 'Kneeling cable crunch flexing the spine against resistance from a high pulley, isolating the rectus abdominis through a full range of motion. Curl through the spine rather than just bending at the hips to keep tension on the abs.' },
  { name: 'Hip Flexor Stretch', category: 'CORE', description: 'Held stretch in a half-kneeling position, driving the hips forward to lengthen the hip flexors of the rear leg. Tight hip flexors are a common contributor to hip and lower-back discomfort — hold duration, not reps, is the point.', trackedFields: ['DURATION'] },
  { name: 'Standing Hip Flexor Stretch', category: 'CORE', description: "Standing variant of the hip flexor stretch, shifting the rear leg back and tucking the pelvis under to lengthen the hip flexor without kneeling. Useful as a between-exercise or end-of-session mobility finisher when getting to the floor isn't convenient.", trackedFields: ['DURATION'] },

  // CARDIO
  { name: 'Rowing Machine', category: 'CARDIO', description: 'Full-body cardiovascular exercise on an ergometer, engaging the legs, core, and upper body in sequence. Low impact on the joints; excellent for conditioning and active recovery. Drive with the legs first, then lean back and pull the handle to the lower chest.' },
  { name: 'Stationary Bike', category: 'CARDIO', description: 'Low-impact cardiovascular exercise performed on an upright or recumbent stationary bike. Allows sustained aerobic work with minimal joint stress; useful as a warm-up, LISS, or interval training tool.' },
  { name: 'Treadmill', category: 'CARDIO', description: 'Walking or running on a motorized belt at a controlled speed and incline. Versatile for warm-ups, steady-state cardio, or interval sessions; incline walking is a joint-friendly alternative to running for lower-body conditioning.' },
  { name: 'Stepmaster / Stairclimber', category: 'CARDIO', description: 'Cardiovascular machine simulating stair climbing, loading the glutes, quads, and calves while elevating the heart rate. Higher glute recruitment than flat walking; intensity can be adjusted by speed and step height.' },
  { name: 'Cardio (Walk/Bike/Swim)', category: 'CARDIO', description: "Generic low-to-moderate intensity steady-state cardio for general conditioning and active recovery — walking, cycling, or swimming, whichever's convenient. Intensity/pace is a program-specific note, not baked into the exercise itself." },

  // RECOVERY
  { name: 'Mobility & Stretching', category: 'RECOVERY', description: 'General mobility and stretching work — no fixed movement list, just time spent on joint mobility and flexibility. Track total duration only.', trackedFields: ['DURATION'] },
];

function resolveTrackedFields(exercise: (typeof EXERCISES)[number]): TrackField[] {
  if (exercise.trackedFields) return exercise.trackedFields;
  return exercise.category === 'CARDIO' ? ['DURATION', 'DISTANCE'] : ['REPS', 'WEIGHT'];
}

// ============================================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================================
async function main() {
  let created = 0;
  let updated = 0;

  for (const exercise of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { userId: null, name: { equals: exercise.name, mode: 'insensitive' } },
    });

    const data = {
      name: exercise.name,
      category: exercise.category,
      description: exercise.description,
      link: exercise.link,
      trackedFields: resolveTrackedFields(exercise),
    };

    if (existing) {
      await prisma.exercise.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.exercise.create({ data: { ...data, userId: null } });
      created++;
    }
  }

  console.log(`Sync complete: ${created} created, ${updated} updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
