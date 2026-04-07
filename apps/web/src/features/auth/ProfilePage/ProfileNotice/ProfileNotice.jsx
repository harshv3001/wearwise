import CircularProgressWithLabel from "../../../../app/components/ui/CircularProgressWithLabel";
import { countCompletedProfileDetails } from "../profileHelpers";
import styles from "./ProfileNotice.module.scss";

const totalDetails = 12;

export default function ProfileNotice({ user }) {
  const completedDetails = countCompletedProfileDetails(user);
  const progress = (completedDetails / totalDetails) * 100;
  const remainingDetails = Math.max(totalDetails - completedDetails, 0);
  const missingImportantDetails = [
    !user?.username,
    !user?.city,
    !user?.pref_styles?.length,
    !user?.pref_colors?.length,
  ].filter(Boolean).length;

  return (
    <>
      {(missingImportantDetails > 0 || remainingDetails > 0) && (
        <section className={styles.noticeCard}>
          <div>
            <p className={styles.noticeTitle}>
              Complete your profile for better outfit suggestions.
            </p>
            <p className={styles.noticeCopy}>
              {remainingDetails > 0
                ? `Complete ${remainingDetails} more detail${
                    remainingDetails === 1 ? "" : "s"
                  } to round out your profile.`
                : "A few final details can still make your recommendations sharper."}
            </p>
          </div>
          <CircularProgressWithLabel value={progress} />
        </section>
      )}
    </>
  );
}
