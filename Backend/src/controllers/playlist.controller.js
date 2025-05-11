import { data } from "react-router-dom";
import { db } from "../libs/db.js";

export const createPlaylist = async(req , res) => {


    try {
        const {name , description} = req.body;

        const userId = req.user.id;

        const playList = await db.Playlist.create({
            data:{
                name ,
                description,
                userId
            }
        })

        res.status(200).json({
            success: true,
            message : "Playlist created successfully",
            playList
        })
    } catch (error) {
        console.error("Error creating playlist: ", error);
        res.status(500).json({
            error: 'Failed to create playlist'
        });
        
    }
}

export const getAllListDetails = async(req , res) => {
    try {
        const playlists = await db.Playlist.findMany({
            where : {
                userId: req.user.id
            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }

        })

        res.status(200).json({
            success : true,
            message:"Playlist fetched successfully",
            playlists
        })
    } catch (error) {
        console.error("Error fetching playlist: ", error);
        res.status(500).json({
            error: 'Failed to fetch playlist'
        });
    }
}

export const getPlayListDetails = async(req , res) => {
    const {playlistId}  = req.params;

    try {
        const playlist = await db.playlist.findUnique({
            where :{
                id: playlistId,
                userId:req.user.id
            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        });

        if(!playlist){
            return res.status(404).json({
                error:"Playlist not found"
            });
        }

        res.status(200).json({
            success : true,
            message:"Playlist fetched successfully",
            playlist,
        })

    } catch (error) {
        console.error("Error fetching playlist: ", error);
        res.status(500).json({
            error: 'Failed to fetch playlist'
        });
    }
}

export const addProblemToPlaylist = async(req , res) => {
    const {playlistId}  = req.params;
    const {problemIds} = req.body
    
    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json(
                {error:"Invalid or missing problemsId"}
            )
        }
        
        const problemsInPlaylist = await db.ProblemPlaylist.createMany({
            data: problemIds.map((problemId)=>({
                playlistId,
                problemId
            }))
        })

        res.status(201).json({
            success: true,
            message: 'Problems added to playlist successfully' ,
            problemsInPlaylist
        })
    } catch (error) {
        console.error("Error adding problem: ", error);
        res.status(500).json({
            error: 'Failed to add problem'
        });
    }
}

export const deletePlaylist = async(req , res) => {
    const {playListId} = req.params
    try {
        const deletedPlaylist = await db.playlist.delete({
            where:{
                id:playListId
            }
        }) 

        res.status(200).json({
            success:true,
            message: 'Playlist deleted successfully',
            deletedPlaylist,
        })
    } catch (error) {
        console.error("Error deleting playlist: ", error);
        res.status(500).json({
            error: 'Failed to delete playlist'
        });
    }
}

export const removeProblemFromPlaylist = async(req , res) => {
    const {playlistId} = req.params;
    const {problemIds} = req.body;

    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json(
                {
                    error:"Invalid or missing problemsId"
                }
            )
        }

        const deletedProblem = await db.ProblemPlaylist.deleteMany({
            where:{
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        })

        res.status(200).json({
            success: true,
            message: 'Probelem removed from playlist successfully',
            deletedProblem
        })
    } catch (error) {
        console.error("Error deleting problem: ", error);
        res.status(500).json({
            error: 'Failed to delete problem'
        });
    }
}


