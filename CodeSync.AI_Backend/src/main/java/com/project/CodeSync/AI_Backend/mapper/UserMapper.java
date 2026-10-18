package com.project.CodeSync.AI_Backend.mapper;


import com.project.CodeSync.AI_Backend.dto.auth.SignupRequest;
import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;
import com.project.CodeSync.AI_Backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(SignupRequest signupRequest);

    UserProfileResponse toUserProfileResponse(User user);

}
