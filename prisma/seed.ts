import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create host user
    const host = await prisma.user.upsert({
        where: { email: "host@hackos.app" },
        update: {},
        create: {
            email: "host@hackos.app",
            name: "Demo Host",
            role: "HOST",
        },
    });
    console.log("✅ Created host:", host.email);

    // Create demo event
    const event = await prisma.event.upsert({
        where: { slug: "demo-hackathon" },
        update: {},
        create: {
            hostId: host.id,
            title: "Demo Hackathon 2026",
            slug: "demo-hackathon",
            description:
                "Join us for an incredible 48-hour hackathon where innovation meets creativity. Build something amazing, win prizes, and connect with fellow developers!",
            location: "San Francisco, CA",
            startDate: new Date("2026-03-15T09:00:00Z"),
            endDate: new Date("2026-03-17T18:00:00Z"),
            registrationDeadline: new Date("2026-03-10T23:59:59Z"),
            maxTeamSize: 4,
            requiresApproval: true,
            isPublished: true,
        },
    });
    console.log("✅ Created event:", event.title);

    // Create some demo participants
    const participants = [
        { name: "Alice Chen", email: "alice@example.com", bio: "Full-stack developer passionate about AI/ML. Loves building tools that help developers.", linkedin: "https://linkedin.com/in/alice" },
        { name: "Bob Smith", email: "bob@example.com", bio: "UX designer turned developer. Expert in React and design systems.", linkedin: "https://linkedin.com/in/bob" },
        { name: "Carol Johnson", email: "carol@example.com", bio: "Backend engineer with a focus on distributed systems and cloud architecture.", linkedin: "https://linkedin.com/in/carol" },
        { name: "Dave Wilson", email: "dave@example.com", bio: "Mobile developer specializing in React Native and Flutter. IoT enthusiast.", linkedin: "https://linkedin.com/in/dave" },
        { name: "Eve Martinez", email: "eve@example.com", bio: "Data scientist and ML engineer. Passionate about NLP and computer vision.", linkedin: "https://linkedin.com/in/eve" },
    ];

    for (const p of participants) {
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {},
            create: {
                email: p.email,
                name: p.name,
                role: "PARTICIPANT",
            },
        });

        const registration = await prisma.registration.create({
            data: {
                eventId: event.id,
                teamLeadId: user.id,
                status: "APPROVED",
                participants: {
                    create: {
                        userId: user.id,
                        isTeamLead: true,
                        bio: p.bio,
                        linkedinUrl: p.linkedin,
                        qrToken: uuid(),
                        isPresent: Math.random() > 0.3,
                    },
                },
            },
        });
        console.log(`✅ Created participant: ${p.name}`);
    }

    // Create a team registration
    const teamLead = await prisma.user.upsert({
        where: { email: "team-lead@example.com" },
        update: {},
        create: {
            email: "team-lead@example.com",
            name: "Frank Lee",
            role: "PARTICIPANT",
        },
    });

    const teamMember = await prisma.user.upsert({
        where: { email: "team-member@example.com" },
        update: {},
        create: {
            email: "team-member@example.com",
            name: "Grace Kim",
            role: "PARTICIPANT",
        },
    });

    const teamReg = await prisma.registration.create({
        data: {
            eventId: event.id,
            teamName: "The Debuggers",
            teamLeadId: teamLead.id,
            status: "APPROVED",
            participants: {
                create: [
                    {
                        userId: teamLead.id,
                        isTeamLead: true,
                        bio: "Team lead, full-stack engineer with 5 years experience",
                        qrToken: uuid(),
                        isPresent: true,
                    },
                    {
                        userId: teamMember.id,
                        isTeamLead: false,
                        bio: "Frontend specialist, loves animations and CSS",
                        qrToken: uuid(),
                        isPresent: true,
                    },
                ],
            },
        },
    });
    console.log("✅ Created team: The Debuggers");

    // Create a judge
    const judge = await prisma.user.upsert({
        where: { email: "judge@hackos.app" },
        update: {},
        create: {
            email: "judge@hackos.app",
            name: "Demo Judge",
            role: "JUDGE",
        },
    });

    await prisma.judgeAssignment.create({
        data: {
            eventId: event.id,
            judgeEmail: judge.email,
            judgeUserId: judge.id,
        },
    });
    console.log("✅ Created judge:", judge.email);

    // Create an announcement
    await prisma.announcement.create({
        data: {
            eventId: event.id,
            title: "Welcome to Demo Hackathon! 🎉",
            body: "We're thrilled to have you here! Check in at the registration desk, grab your goodie bag, and get ready for an amazing 48 hours of hacking. WiFi password: hackos2026",
            targetGroup: "ALL",
        },
    });
    console.log("✅ Created announcement");

    console.log("\n🎉 Seeding complete!");
    console.log("\n📝 Login credentials:");
    console.log("   Host: host@hackos.app");
    console.log("   Judge: judge@hackos.app");
    console.log(`\n🔗 Event page: /event/demo-hackathon`);
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
