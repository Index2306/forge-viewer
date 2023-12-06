import _ from 'lodash';

export const camelCaseKeys = (obj: any): any => {
    return _.mapKeys(obj, (v, k) => _.camelCase(k))
}