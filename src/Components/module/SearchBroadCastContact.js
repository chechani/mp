import React, {useCallback, useRef} from 'react';
import {useSearchBroadCastGroupMemberMutation} from '../../api/store/slice/broadCastGroupSlice';
import {DataMode} from '../../Utils/Constant';
import ContainerComponent from '../Common/ContainerComponent';
import DynamicSearch from '../Common/DynamicSearch';
import BroadCastGroupDetailColum from '../Colums/BroadCastGroupDetailColum'

const SearchBroadCastContact = ({route}) => {
  const {name} = route?.params;
  const dynamicSearchRef = useRef(null);

  const [triggerSearchContact] = useSearchBroadCastGroupMemberMutation();

  const fetchSearchResultsAPI = useCallback(
    async (query, page = 1, limit = 20, signal) => {
      try {
        const payload = {
          name: name,
          search_query: query.trim(),
        };
        const response = await triggerSearchContact(payload, {signal}).unwrap();
        const items = response?.data ?? [];
        const hasMore = items.length === limit; 
  
        
        return {
          results: items,
          hasMore,
        };
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Search request aborted');
          return {results: [], hasMore: false};
        }
        console.error('Search Error:', error);
        return {results: [], hasMore: false, error: error.message};
      }
    },
    [triggerSearchContact],
  );

  return (
    <ContainerComponent noPadding useScrollView={false}>
      <DynamicSearch
        ref={dynamicSearchRef}
        data={[]}
        dataMode={DataMode.REMOTE}
        searchKeys={['enable', 'group_member', 'mobile_no', 'contact_name']}
        fetchSearchResults={fetchSearchResultsAPI}
        placeholder="Search Contact..."
        minCharacters={0}
        isgoBackArrowShow={true}
        renderCustomItem={({item}) => <BroadCastGroupDetailColum item={item} />}
      />
    </ContainerComponent>
  );
};

export default SearchBroadCastContact;
