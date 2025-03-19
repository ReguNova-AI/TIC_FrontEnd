import * as actionTypes from './actionTypes';

import { APP_ROLES, USER_ROLES } from 'shared/constants';

export const userInfoFetchSuccess = (info, permissions) => {
  return {
    type: actionTypes.USER_INFO_FETCH_SUCCESS,
    info,
    permissions,
  };
};

// const userInfoFetchFailure = error => {
//   return {
//     type: actionTypes.USER_INFO_FETCH_FAILURE,
//     error: error,
//   };
// };

const userInfoFetchStart = () => {
  return {
    type: actionTypes.USER_INFO_FETCH_START,
  };
};

const authRole =()=>{
  return {
    type: actionTypes.AUTH_ROLE,
  };
}

// const fetchPermissions = async (roleId,dispatch) => {
//   await PermissionApi.getRolePermissionForSolutions({ roleId })
//     .then(permissionsResponse => {
//       const {solutionPermissionMap,subFeaturePermissionMap} =  solutionAndSubFeatureMapping(permissionsResponse)
//       dispatch(
//         saveSolutionPermission(solutionPermissionMap, subFeaturePermissionMap)
//       );
//     })
//     .catch(err => {
//       console.error(err);
//     });
// };

export const fetchUserInfo = keycloak => {
  return dispatch => {
    dispatch(userInfoFetchStart());

    const {
      given_name,
      family_name,
      email,
      email_verified,
      preferred_username,
      sub,
    } = keycloak.idTokenParsed;

    let userInfo = {
      firstName: given_name,
      lastName: family_name,
      email: email,
      email_verified: email_verified,
      userName: preferred_username,
      userId: sub,
      roleId: '',
    };

    const userPermissions = {
      admin: {},
      developer: {},
      isSuperAdmin: false,
      isITAdmin: false,
      ITAdminPermissionState: null,
    };

    const hasMphAdminAccess = keycloak.realmAccess.roles.includes(
      APP_ROLES.MPH_ADMIN
    );

    const allowedRoles = [
      USER_ROLES.Compliance,
      USER_ROLES.Internal_Developer,
      USER_ROLES.Third_Party_Developer,
      USER_ROLES.IT_Admin,
      USER_ROLES.ORGANIZATION_ADMIN,
      USER_ROLES.DEVELOPER,
      USER_ROLES.CustomerSupportRepresentative,
      USER_ROLES.ContentManager,
    ];

    // if (hasMphAdminAccess) {
    //   userPermissions.isSuperAdmin = true;
    //   OrganizationApi.getAllOrganizations()
    //     .then(response => {
    //       const orgData = response ? response : [];

    //       // orgData.forEach(item => {
    //       //   const adminResources = UserRolesApiService.getPermissionsByRole([
    //       //     APP_ROLES.MPH_ADMIN,
    //       //   ]);

    //       //   userPermissions.admin[item.id] =
    //       //     getResourcePermissions(adminResources);
    //       // });

    //       dispatch(userInfoFetchSuccess(userInfo, userPermissions));

    //       // dispatch(organizationsFetchSuccess(orgData));
    //       // dispatch(affiliatesFetchSuccess([]));
    //     })
    //     .catch(error => {
    //       dispatch(userInfoFetchSuccess(userInfo, userPermissions));
    //       // dispatch(organizationsFetchSuccess([]));
    //       // dispatch(affiliatesFetchSuccess([]));
    //     });
    //   }
    //  else {
    //   OrganizationUsersApi.getUser(userInfo.userId)
    //     .then(async response => {
    //       const { id, phone, status, orgId } = response;

    //       const loggedInUserRoles = response.userRoles
    //         ? response.userRoles
    //         : [];

    //       const roleId = loggedInUserRoles?.[0]?.roleId;

    //       await fetchPermissions(roleId,dispatch);
    //       userInfo.roleId = roleId;

    //       // const userRoles = loggedInUserRoles.filter(item =>
    //       //   allowedRoles.includes(item.roleName)
    //       // );
    //       const userRoles = response?.userRoles;
          
    //       if (
    //         userRoles[0].roleName === 'INTERNAL_DEVELOPER' ||
    //         userRoles[0].roleName === 'EXTERNAL_DEVELOPER' ||
    //         userRoles[0].roleName === 'DEVELOPER'
    //       ) {
    //         userRoles[0].affiliateId = 'DEV'; //setting up affiliate ID manually for DEV env testing
    //       } else {
    //         userRoles[0].affiliateId = userRoles?.[0]?.affiliateId?.[0];
    //       }
        
    //       if (
    //         userRoles.some(
    //           item =>
    //             item.roleName === USER_ROLES.IT_Admin || item.roleName === USER_ROLES.ORGANIZATION_ADMIN
                
    //         )
    //       ) {
    //         userPermissions.ITAdminPermissionState = status;
    //         userPermissions.isITAdmin = true;
    //         userInfo.accessName = userRoles[0].roleName;
    //         const adminIndex = userRoles.findIndex(
    //           item =>
    //             item.roleName === USER_ROLES.IT_Admin ||
    //             item.roleName === USER_ROLES.ORGANIZATION_ADMIN
    //         );
    //         let orgId = userRoles[adminIndex].orgId;
    //         OrganizationApi.getOrganizationById(orgId)
    //           .then(response => {
    //             const adminResources = UserRolesApiService.getPermissionsByRole(
    //               [USER_ROLES.ORGANIZATION_ADMIN]
    //             );
    //             userPermissions.admin[orgId] =
    //               getResourcePermissions(adminResources);
    //             dispatch(userInfoFetchSuccess(userInfo, userPermissions));
    //             dispatch(selectedOrgFetchSuccess(response));
    //             dispatch(affiliatesFetchSuccess([]));
    //           })
    //           .catch(error => {
    //             dispatch(userInfoFetchSuccess(userInfo, userPermissions));
    //             dispatch(organizationsFetchSuccess([]));
    //             dispatch(affiliatesFetchSuccess([]));
    //           });
    //       } else {
    //         const useAffiliateIteration = arr => {
    //           const map = [];
    //           for (let value of arr) {
    //             if (
    //               map.findIndex(
    //                 item =>
    //                   item.orgId === value.orgId &&
    //                   item.affiliateId === value.affiliateId
    //               ) === -1
    //             ) {
    //               map.push(value);
    //             }
    //           }

    //           return map;
    //         };

    //         // const uniqueOrgs = useOrgIteration(userRoles);
    //         // const uniqueOrgsWithAccess = uniqueOrgs.filter(item =>
    //         //   [USER_ROLES.Org_Owner].includes(item.roleName)
    //         // );

    //         const uniqueAffiliates = useAffiliateIteration(userRoles);
    //         const uniqueAffiliatesWithAccess = uniqueAffiliates.filter(
    //           item => item.affiliateId !== null
    //         );

    //         // const orgs = uniqueOrgsWithAccess.map(item => ({
    //         //   id: item.orgId,
    //         //   name: item.orgName,
    //         // }));

    //         const affiliates = uniqueAffiliatesWithAccess.map(item => ({
    //           id: item.affiliateId,
    //           orgId: item.orgId,
    //           name: item.affiliateName,
    //         }));

    //         // uniqueOrgsWithAccess.forEach(item => {
    //         //   const adminResources = UserRolesApiService.getPermissionsByRole([
    //         //     item.roleName,
    //         //   ]);

    //         //   userPermissions.admin[item.orgId] =
    //         //     getResourcePermissions(adminResources);
    //         // });

    //         userRoles
    //           .filter(item => item.affiliateId !== null)
    //           .forEach(item => {
    //             const devResources = UserRolesApiService.getPermissionsByRole([
    //               item.roleName,
    //             ]);

    //             const devPermissions = getResourcePermissions(devResources);

    //             if (
    //               userPermissions.developer[`${item.orgId}_${item.affiliateId}`]
    //             ) {
    //               userPermissions.developer[
    //                 `${item.orgId}_${item.affiliateId}`
    //               ] = {
    //                 ...userPermissions.developer[
    //                   `${item.orgId}_${item.affiliateId}`
    //                 ],
    //                 ...devPermissions,
    //               };
    //             } else {
    //               userPermissions.developer[
    //                 `${item.orgId}_${item.affiliateId}`
    //               ] = devPermissions;
    //             }
    //           });
    //         userInfo.accessName = userRoles[0].roleName;
    //         dispatch(userInfoFetchSuccess(userInfo, userPermissions));

    //         // dispatch(organizationsFetchSuccess(orgs));
    //         dispatch(organizationsFetchSuccess([]));
    //         if (status === 'Approved') {
    //           dispatch(affiliatesFetchSuccess(affiliates));
    //         } else {
    //           dispatch(affiliatesFetchSuccess(status));
    //         }
    //       }
    //     })
    //     .catch(err => {
    //       dispatch(userInfoFetchSuccess(userInfo, userPermissions));
    //       dispatch(organizationsFetchSuccess([]));
    //       dispatch(affiliatesFetchSuccess([]));
    //     });
    // }
  };
};

export const saveSolutionPermission = (
  solutionPermissions,
  subFeaturePermissions
) => {
  return {
    type: actionTypes.SAVE_SOLUTION_PERMISSIONS,
    solutionPermissions,
    subFeaturePermissions,
  };
};
