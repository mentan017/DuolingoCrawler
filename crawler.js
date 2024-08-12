const https = require('https');
const fs = require('fs');
require('dotenv').config();

var user = {};
var userIDs = [process.env.INIT_ID];

async function FetchUser(index){
    await GetUserData(userIDs[index]);
    await GetFollowers(userIDs[index], index);
    await GetFollowing(userIDs[index], index);
    if(index) fs.appendFileSync('./users.json',  `,${JSON.stringify(user)}`);
    else fs.appendFileSync('./users.json',  `${JSON.stringify(user)}`);
    index++;
    if(!(index%5)){
        fs.writeFileSync('./userIds.json', JSON.stringify(userIDs));
    }
    if(index < 1000 && userIDs.length > index){
        console.log(`[INFO] Fetching userId ${userIDs[index]}, index: ${index}, userIds array length: ${userIDs.length}`);
        setTimeout(FetchUser, 1000, index);
    }else{
        fs.appendFileSync('./users.json', ']');
        fs.writeFileSync('./userIds.json', JSON.stringify(userIDs));
    }
}
async function GetFollowers(userID){
    var numFollowers = Infinity;
    var fetchedFollowers = 0;
    user.followers = [];
    while(fetchedFollowers < numFollowers){
        var additionalQuery = "";
        if(fetchedFollowers != 0) additionalQuery = `&pageAfter=v1:${fetchedFollowers}`;
        var res = await fetch(`https://www.duolingo.com/2017-06-30/friends/users/${userID}/followers?pageSize=2000${additionalQuery}`, {
            headers: {
                "Cookie":process.env.COOKIE
            }
        });
        if(res.status == 200){
            var data = await res.json();
            numFollowers = data.followers.totalUsers;
            var followers = data.followers.users;
            for(var i=0; i<followers.length; i++){
                user.followers.push({
                    userId: followers[i].userId,
                    username: followers[i].username
                })
                if(userIDs.indexOf(followers[i].userId) == -1){
                    userIDs.push(followers[i].userId);
                }
            }
            if(data.followers.users.length == 0) numFollowers = 0;
            fetchedFollowers += data.followers.users.length;
        }else{
            console.log(`An error occured at GetFollowers()\nError Status Code: ${res.status}`);
        }
    }
}
async function GetFollowing(userID){
    var numFollowing = Infinity;
    var fetchedFollowing = 0;
    user.following = [];
    while(fetchedFollowing < numFollowing){
        var additionalQuery = "";
        if(fetchedFollowing != 0) additionalQuery = `&pageAfter=v1:${fetchedFollowing}`;
        var res = await fetch(`https://www.duolingo.com/2017-06-30/friends/users/${userID}/following?pageSize=2000${additionalQuery}`, {
            headers: {
                "Cookie":process.env.COOKIE
            }
        });
        if(res.status == 200){
            var data = await res.json();
            numFollowing = data.following.totalUsers;
            var following = data.following.users;
            for(var i=0; i<following.length; i++){
                user.following.push({
                    userId: following[i].userId,
                    username: following[i].username
                })
                if(userIDs.indexOf(following[i].userId) == -1){
                    userIDs.push(following[i].userId);
                }
            }
            if(data.following.users.length == 0) numFollowing = 0;
            fetchedFollowing += data.following.users.length;
        }else{
            console.log(`An error occured at GetFollowing()\nError Status Code: ${res.status}`);
        }
    }
}
async function GetUserData(userID){
    var res = await fetch(`https://www.duolingo.com/2017-06-30/users/${userID}?fields=blockedUserIds,blockerUserIds,canUseModerationTools,courses,creationDate,currentCourseId,email,emailAnnouncement,emailAssignment,emailAssignmentComplete,emailClassroomJoin,emailClassroomLeave,emailEditSuggested,emailEventsDigest,emailFollow,emailPass,emailPromotion,emailResearch,emailWeeklyProgressReport,emailSchoolsAnnouncement,emailSchoolsNewsletter,emailSchoolsProductUpdate,emailSchoolsPromotion,emailStreamPost,emailWeeklyReport,enableMicrophone,enableSoundEffects,enableSpeaker,experiments{gweb_diamond_tournament_dogfooding,minfra_web_stripe_setup_intent,mochi_web_fp_in_app_invites_v3,path_web_course_complete_slides,path_web_sections_overview,path_web_smec,retention_web_copysolidate_sf,retention_web_in_progress_streak_society,retention_web_perfect_streak_challenge,retention_web_remove_lapsed_banners,retention_web_streak_freeze_from_duo,spack_web_animation_checklist,spack_web_copysolidate_hearts,spack_web_copysolidate_super_longscroll,spack_web_delay_cta_long_scroll,spack_web_fp_upgrade_hook,spack_web_super_promo_d12_ft_ineligible,spack_web_super_promo_d12_pf2_v2,tsl_web_tournament_port,writing_japanese_speak_alternatives},facebookId,fromLanguage,gemsConfig,googleId,hasPlus,health,id,inviteURL,lastResurrectionTimestamp,learningLanguage,location,name,optionalFeatures,persistentNotifications,picture,plusDiscounts,practiceReminderSettings,referralInfo,rewardBundles,sessionCount,streak,streakData{currentStreak,longestStreak,previousStreak},timezone,timezoneOffset,totalXp,trackingProperties,username,webNotificationIds,xpGains,xpGoal,zhTw`, {
        headers: {
            "Cookie":process.env.COOKIE
        }
    });
    if(res.status == 200){
        var data = await res.json();
        for(var i=0; i<data.courses.length; i++){
            delete data.courses[i].preload;
            delete data.courses[i].placementTestAvailable;
            delete data.courses[i].authorId;
            delete data.courses[i].healthEnabled;
            delete data.courses[i].crowns;
        }
        user = data;
    }else{
        console.log(`An error occured at GetUserData()\nError Status Code: ${res.status}`);
    }
}
fs.writeFileSync('./users.json', "[");
console.log(`[INFO] Fetching userId ${userIDs[0]}, index: 0, userIds array length: ${userIDs.length}`);
FetchUser(0);