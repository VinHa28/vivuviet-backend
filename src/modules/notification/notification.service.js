import userModel from "../user/user.model";
import notificationModel from "./notification.model";

export const createNotificaiton = async ({
  recipient,
  sender,
  title,
  message,
  type,
  relatedId,
  onModel,
}) => {
  if (type === "SYSTEM") {
    const users = await userModel
      .find({ role: { $ne: "admin" } })
      .select("_id");
    const notifications = users.map((user) => ({
      recipient: user._id,
      sender,
      title,
      message,
      type,
      relatedId,
      onModel,
    }));
    return await notificationModel.insertMany(notifications);
  }

  return await notificationModel.create({
    recipient,
    sender,
    title,
    message,
    type,
    relatedId,
    onModel,
  });
};
