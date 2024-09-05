const { Note_Status } = require('../enum_ish');
const { User } = require('../models/engine/db_storage');
const { Types } = require('mongoose');

/**
 * Contains the NotificationService class
 * handles all notification operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class NotificationService {

  constructor() {
  }

  /**
   * Asynchronously notifies a user with a given note.
   *
   * @param {Object} note - the note to be sent
   * @param {Object} user - the user to be notified
   * @return {Promise<Object>} the saved user object
   */
  async notify(note=null, user=null ) {
    if(!note || !user) {
      return null;
    }

    const { createdAt } = user;
    if(!createdAt) {
      user = await User.findById(new Types.ObjectId(user))
    }

    const { subject, comment } = note;

    if (!subject || !comment) { return null; }
    try {
      note.status = Note_Status.sent;
      user.notifications.push(note);
      await user.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Batch notes to user.
   *
   * @param {Array} notes - the array of notes
   * @param {Object} user - the user object
   * @return {Promise} - the updated user object
   */
  async batch_notes_to_user(notes=[], user=null ) {
    if(!notes || !user) {
      return null;
    }
    try {
      const { createdAt } = user;
      if(!createdAt) {
        user = await User.findById(new Types.ObjectId(user))
      }

      if(notes.length > 0) {
        notes.map((note) => {
          note.status = Note_Status.sent;
          user.notifications.push(note);
        })
        await user.save();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asynchronously notifies all specified receivers with a comment and subject.
   *
   * @param {Array} receivers - An array of receiver objects.
   * @param {string} comment - The comment to be sent.
   * @param {string} subject - The subject of the notification.
   * @return {Promise} A promise that resolves when all notifications have been sent.
   */
  async notify_all(receivers=null, comment=null, subject=null) {
    if (!receivers || !comment || !subject) { return null; }
    try {
      let promises = [];
      receivers.map((user) => {
        user.notifications.push({
          to: user,
          subject: subject,
          comment: comment,
          status: Note_Status.sent,
        });
        promises.push(user.save());
      });
      return await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }
  
}


const notification_service = new NotificationService(); 

module.exports = { notification_service };
