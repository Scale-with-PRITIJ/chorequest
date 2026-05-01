import 'dotenv/config';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'scale-with-pritij'
  });
}

const db = getFirestore();

async function testWeeklyLogic() {
  console.log("🔄 Connecting to Firestore to test weekly logic on real data...");
  try {
    const familiesSnapshot = await db.collection('families').limit(3).get();
    if (familiesSnapshot.empty) {
      console.log("⚠️ No families found in DB.");
      return;
    }

    console.log(`✅ Found ${familiesSnapshot.docs.length} families in database. Testing first available...`);

    const familyDoc = familiesSnapshot.docs[0];
    const data = familyDoc.data();
    const chores = data.chores || [];
    const children = data.children || [];
    
    console.log(`\nFamily ID: ${familyDoc.id}`);
    console.log(`Kids: ${children.map((c: any) => c.name).join(', ')}`);
    console.log(`Total Chores: ${chores.length}`);
    
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const startOfWeekStr = monday.toISOString().split('T')[0];

    console.log(`\n📅 Start of Current Week (Monday): ${startOfWeekStr}`);

    const weeklyChores = chores.filter((c: any) => c.frequency === 'weekly');
    console.log(`📌 Found ${weeklyChores.length} weekly chores.`);

    if (weeklyChores.length > 0) {
        weeklyChores.forEach((c: any) => {
            const completedThisWeek = c.completedDates?.some((d: string) => d >= startOfWeekStr);
            console.log(`- [${completedThisWeek ? '✅' : '❌'}] ${c.title} (Assigned to: ${children.find((child: any) => child.id === c.assignedTo)?.name || 'Unknown'})`);
            console.log(`      Completed Dates: [${(c.completedDates || []).join(', ')}]`);
        });
    } else {
        console.log("No weekly chores available to test for this family.");
    }
  } catch (error) {
    console.error("❌ Error accessing DB. Note: Make sure Google Cloud auth is configured.", error);
  }
}

testWeeklyLogic();
