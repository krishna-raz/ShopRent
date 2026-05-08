const mongoose = require('mongoose');
const Payment = require('./models/Payment');
require('dotenv').config();

async function mergeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find all payments
    const payments = await Payment.find({});
    const groups = {};

    // Group by tenantId and month
    payments.forEach(p => {
      const key = `${p.tenantId}_${p.month}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(p);
    });

    for (const key in groups) {
      if (groups[key].length > 1) {
        const dups = groups[key];
        console.log(`Found ${dups.length} duplicates for ${key}`);

        // Keep the first one, merge others into it
        const master = dups[0];
        let totalPaid = master.paidAmount;
        
        for (let i = 1; i < dups.length; i++) {
          totalPaid += dups[i].paidAmount;
          await Payment.findByIdAndDelete(dups[i]._id);
          console.log(`Deleted duplicate: ${dups[i]._id}`);
        }

        master.paidAmount = totalPaid;
        master.dueAmount = Math.max(0, master.rentAmount - totalPaid);
        master.status = master.paidAmount >= master.rentAmount ? 'Paid' : 'Partial';
        await master.save();
        console.log(`Updated master record: ${master._id} with Total Paid: ${totalPaid}`);
      }
    }

    console.log('✅ Cleanup complete!');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

mergeDuplicates();
