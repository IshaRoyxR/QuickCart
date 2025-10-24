import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User"; // make sure path is correct

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * Inngest Function to SAVE user data from Clerk
 */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", name: "Sync User Creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id, // store Clerk ID directly as _id
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await connectDB();
    await User.create(userData);

    return { success: true, action: "user_created" };
  }
);

/**
 * Inngest Function to UPDATE user data in database
 */
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", name: "Sync User Updation" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await connectDB();
    await User.findOneAndUpdate({ _id: id }, userData);

    return { success: true, action: "user_updated" };
  }
);

/**
 * Inngest Function to DELETE user from database
 */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", name: "Sync User Deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();

    // Clerk ID is not a Mongo ObjectId, so use findOneAndDelete
    const deletedUser = await User.findOneAndDelete({ _id: id });

    if (!deletedUser) {
      console.warn(`⚠️ No user found with Clerk ID: ${id}`);
    }

    return { success: true, deleted: !!deletedUser };
  }
);
