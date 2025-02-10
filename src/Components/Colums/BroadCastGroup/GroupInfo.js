// src/Components/module/GroupInfo.js
import React from 'react';
import { View } from 'react-native';
import * as SvgIcon from '../../../assets'; 
import TextInputComp from '../../Common/TextInputComp';
import { styles } from './styles'; 

const GroupInfo = ({ groupName, title, setCreateGroup }) => {
    return (
        <View style={styles.groupInfoContainer}>
            <TextInputComp
                placeholder="Group Name"
                value={groupName}
                onChangeText={text =>
                    setCreateGroup(prevState => ({ ...prevState, groupName: text }))
                }
                textInputLeftIcon={SvgIcon.GroupIcon}
                istextInputLeftIcon={true}
                inputStyle={styles.groupInput}
            />
            <TextInputComp
                placeholder="Title"
                value={title}
                onChangeText={text =>
                    setCreateGroup(prevState => ({ ...prevState, title: text }))
                }
                textInputLeftIcon={SvgIcon.Artical}
                istextInputLeftIcon={true}
                inputStyle={styles.groupInput}
            />
        </View>
    );
};

export default GroupInfo;